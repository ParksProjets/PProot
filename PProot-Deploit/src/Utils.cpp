/*
 *
 *  Fichier "fourre-tout" contenant des fonctions utiles
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */




#include "Utils.h"
#include "Registry.h"
#include "WindowsService.h"

#include <tlhelp32.h>




// Convertie un char* en wchar_t*

const wchar_t *GetWC(const char *c)
{
    const size_t cSize = strlen(c)+1;
    wchar_t* wc = new wchar_t[cSize];
    mbstowcs (wc, c, cSize);

    return wc;
}





// Obtient le chemein dans lequel est le programme

std::string getCurrentPath()
{

    HMODULE hModule = GetModuleHandleA(NULL);
    CHAR cpath[MAX_PATH];
    GetModuleFileNameA(hModule, cpath, MAX_PATH);


    std::string path = cpath;

    size_t i = path.find_last_of('/');
    if (i == std::string::npos)
        i = path.find_last_of('\\');

    if (i != std::string::npos)
        return path.substr(0, i + 1);
    else
        return path;
}







// Détermine si le dossier existe

bool dirExists(const std::string& dirName_in)
{
    DWORD ftyp = GetFileAttributesA(dirName_in.c_str());

    if (ftyp == INVALID_FILE_ATTRIBUTES)
        return false;  // Le chemin est invalide

    if (ftyp & FILE_ATTRIBUTE_DIRECTORY)
        return true;   // C'est un dossier

    return false;
}








// Obtient le contenue d'une URL

std::string GetUrlContent(std::string host, std::string path)
{

    std::wstring whost;
    whost.assign(host.begin(), host.end());

    std::wstring wpath;
    wpath.assign(path.begin(), path.end());


    HINTERNET hInternet = InternetOpenW(L"PProotUrl", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);

    if( hInternet == NULL ) {
        std::cout << "InternetOpenW failed with error code " << GetLastError() << std::endl;
        InternetCloseHandle(hInternet);
        return "";
    }



    HINTERNET hConnect = InternetConnectW(hInternet, whost.c_str(), 80, NULL, NULL, INTERNET_SERVICE_HTTP, 0, NULL);

    if( hConnect == NULL ) {
      std::cout << "InternetConnectW failed with error code " << GetLastError() << std::endl;
      InternetCloseHandle(hInternet);
      InternetCloseHandle(hConnect);
      return "";
    }



    const wchar_t* parrAcceptTypes[] = { L"*/*", NULL };
    HINTERNET hRequest = HttpOpenRequestW(hConnect, L"GET", wpath.c_str(), NULL, NULL, parrAcceptTypes, 0, 0);

    if( hRequest==NULL ) {
        std::cout << "HttpOpenRequestW failed with error code " << GetLastError() << std::endl;
        InternetCloseHandle(hRequest);
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return "";
    }



    BOOL bRequestSent = HttpSendRequestW(hRequest, NULL, 0, NULL, 0);

    if( !bRequestSent ) {
        std::cout << "HttpSendRequestW failed with error code " << GetLastError() << std::endl;
        return "";
    }



    std::string strResponse;
    const int nBuffSize = 1024;
    char buff[nBuffSize];

    BOOL bKeepReading = true;
    DWORD dwBytesRead = -1;

    while(bKeepReading && dwBytesRead!=0)
    {
        bKeepReading = InternetReadFile( hRequest, buff, nBuffSize, &dwBytesRead );
        strResponse.append(buff, dwBytesRead);
    }

    std::cout << "'" << strResponse << "'" << std::endl;

    InternetCloseHandle(hRequest);
    InternetCloseHandle(hConnect);
    InternetCloseHandle(hInternet);


    return strResponse;

}






// Ferme le gestionnaire de tâche

bool CloseTaskMgr()
{
    // Get the process list snapshot.
    HANDLE hProcessSnapShot = CreateToolhelp32Snapshot(TH32CS_SNAPALL, 0 );

    // Initialize the process entry structure.
    PROCESSENTRY32 ProcessEntry = { 0 };
    ProcessEntry.dwSize = sizeof( ProcessEntry );

    // Get the first process info.
    BOOL Return = FALSE;
    Return = Process32First( hProcessSnapShot,&ProcessEntry );

    if (!Return) {
        printf("closeTaskMgr: erreur Process32First");
        return false;
    }


    do {

        int value = _wcsicmp(ProcessEntry.szExeFile, L"taskmgr.exe");
        if (value == 0) {
            HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, ProcessEntry.th32ProcessID); //Open Process to terminate
            TerminateProcess(hProcess,0);
            CloseHandle(hProcess); //Close Handle }
       }

    } while( Process32Next( hProcessSnapShot, &ProcessEntry ));


    // Close the handle
    CloseHandle( hProcessSnapShot );
    return true;
}





// Registre du gestionnaire de tâche

#define CAS_SUBKEY L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\taskmgr.exe"


// Désactive Ctrl+Alt+Suppr ou Ctrl+Maj+Echap

bool DisableCAS()
{

    HKEY hKey = NULL;

    // La clé n'existe pas, on la crée
    if (RegOpenKeyEx (HKEY_LOCAL_MACHINE, CAS_SUBKEY, 0, KEY_WRITE, &hKey) != ERROR_SUCCESS) {

        DWORD dwDisposition;
        hKey = NULL;

        if (RegCreateKeyEx(HKEY_LOCAL_MACHINE, CAS_SUBKEY, 0, NULL, 0, KEY_WRITE, NULL, &hKey, &dwDisposition) != ERROR_SUCCESS)
            return false;

    }


    LPCTSTR data = L"Hotkey Disabled\0";


    RegSetValueEx (hKey, L"Debugger", 0, REG_SZ, (LPBYTE)data, wcslen(data)*2+1);
    RegCloseKey(hKey);

    return true;
}




// Réactive Ctrl+Alt+Suppr ou Ctrl+Maj+Echap

bool EnableCAS()
{

    HKEY hkey = NULL;

    if (RegOpenKeyEx( HKEY_LOCAL_MACHINE, CAS_SUBKEY, 0, KEY_READ | KEY_WRITE, &hkey) != ERROR_SUCCESS)
        return false;

    bool success = Registry::RegRemoveSubkeys(hkey);
    RegCloseKey(hkey);

    if (!success)
        return false;

    if (RegDeleteKey(HKEY_LOCAL_MACHINE, CAS_SUBKEY) != ERROR_SUCCESS)
        return false;

    return true;
}









// Fonction qui supprime PProot !

bool DeleteAll()
{

    // Réactive Ctrl+Alt+Suppr

    EnableCAS();



    // Supprime le registre de PProot

    Registry::remove();



    // Envoi la commande de suppression

    WCHAR szModuleName[MAX_PATH];

    STARTUPINFO si = {0};
    PROCESS_INFORMATION pi = {0};

    STARTUPINFO si2 = {0};
    PROCESS_INFORMATION pi2 = {0};

    GetModuleFileName(NULL, szModuleName, MAX_PATH);


    wstring path = szModuleName;

    size_t pos = path.find_last_of(L"/\\");
    path = path.substr(0, pos);

    wstring name = SERVICE_NAME;
    wstring cmd = L"cmd.exe /C ping 1.1.1.1 -n 1 -w 8000 >nul & sc delete " + name + L" & rmdir /Q /S \"" + path + L"\"";


    CreateProcess(NULL, (LPWSTR)cmd.c_str(), NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi);

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);

    return true;
}
