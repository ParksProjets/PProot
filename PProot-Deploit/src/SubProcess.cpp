/*
 *
 *  Classe gérant un autre processus (SubProcess)
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "SubProcess.h"
#include <stdio.h>
#include <tlhelp32.h>
#include <wtsapi32.h>
#include <userenv.h>


SubProcess::SubProcess(string name) :
    m_subProcessHandle(NULL)
{
     m_name.assign(name.begin(), name.end());
}



SubProcess::~SubProcess()
{
    stop();
}






bool SubProcess::start()
{

    stop();


    wchar_t desktop[] = L"winsta0\\default";


    PROCESS_INFORMATION pi;
    STARTUPINFO si;
    BOOL bResult = FALSE;
    DWORD dwSessionId, winlogonPid;
    HANDLE hUserToken, hUserTokenDup, hPToken, hProcess;
    DWORD dwCreationFlags;



    // On obtient l'id de la session
    dwSessionId = WTSGetActiveConsoleSessionId();



    // On recherche "winlogon.exe"

    PROCESSENTRY32 procEntry;

    HANDLE hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnap == INVALID_HANDLE_VALUE)
        return false;

    procEntry.dwSize = sizeof(PROCESSENTRY32);

    if (!Process32First(hSnap, &procEntry))
        return false;

    do
    {
        if (_wcsicmp(procEntry.szExeFile, L"winlogon.exe") == 0)
        {

            DWORD winlogonSessId = 0;
            if (ProcessIdToSessionId(procEntry.th32ProcessID, &winlogonSessId)
                    && winlogonSessId == dwSessionId)
            {
                winlogonPid = procEntry.th32ProcessID;
                break;
            }
        }

    } while (Process32Next(hSnap, &procEntry));



    // On obteint le token de session
    WTSQueryUserToken(dwSessionId, &hUserToken);

    dwCreationFlags = NORMAL_PRIORITY_CLASS | CREATE_NEW_CONSOLE;

    ZeroMemory(&si, sizeof(STARTUPINFO));
    si.cb = sizeof(STARTUPINFO);
    si.lpDesktop = desktop;
    ZeroMemory(&pi, sizeof(pi));

    TOKEN_PRIVILEGES tp;
    LUID luid;

    hProcess = OpenProcess(MAXIMUM_ALLOWED, FALSE, winlogonPid);

    if (!::OpenProcessToken(hProcess,
        TOKEN_ADJUST_PRIVILEGES|TOKEN_QUERY|TOKEN_DUPLICATE|
        TOKEN_ASSIGN_PRIMARY|TOKEN_ADJUST_SESSIONID|TOKEN_READ|TOKEN_WRITE,&hPToken))
    {
        printf("\nErreur: Process token open, %lu", GetLastError());
    }


    if (!LookupPrivilegeValue(NULL, SE_DEBUG_NAME, &luid))
    {
        printf("\nErreur: Lookup Privilege value, %lu", GetLastError());
    }

    tp.PrivilegeCount = 1;
    tp.Privileges[0].Luid = luid;
    tp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

    DuplicateTokenEx(hPToken, MAXIMUM_ALLOWED, NULL, SecurityIdentification, TokenPrimary, &hUserTokenDup);


    // Adjust Token privilege
    SetTokenInformation(hUserTokenDup, TokenSessionId, (void*)dwSessionId, sizeof(DWORD));

    if (!AdjustTokenPrivileges(hUserTokenDup, FALSE, &tp, sizeof(TOKEN_PRIVILEGES), (PTOKEN_PRIVILEGES)NULL, NULL))
    {
       printf("\nErreur: Adjust Privilege value, %lu", GetLastError());
    }

    if (GetLastError() == ERROR_NOT_ALL_ASSIGNED)
    {
        printf("\nToken does not have the provilege");
    }



    // On créer un Evironment Block
    LPVOID pEnv = NULL;

    if(CreateEnvironmentBlock(&pEnv,hUserTokenDup,TRUE))
       dwCreationFlags |= CREATE_UNICODE_ENVIRONMENT;
    else
      pEnv=NULL;



    // On démarre, enfin, le process

    bResult = CreateProcessAsUser(
          hUserTokenDup,   // client's access token
          NULL,            // file to execute
          (LPWSTR)m_name.c_str(),            // command line
          NULL,            // pointer to process SECURITY_ATTRIBUTES
          NULL,            // pointer to thread SECURITY_ATTRIBUTES
          FALSE,           // handles are not inheritable
          dwCreationFlags, // creation flags
          pEnv,            // pointer to new environment block
          NULL,            // name of current directory
          &si,             // pointer to STARTUPINFO structure
          &pi              // receives information about new process
       );


    m_subProcessHandle = pi.hProcess;


    // On ferme les Handles
    CloseHandle(hProcess);
    CloseHandle(hUserToken);
    CloseHandle(hUserTokenDup);
    CloseHandle(hPToken);

    return bResult;

}






void SubProcess::stop()
{

    if ( m_subProcessHandle )
    {

        if ( WaitForSingleObject( m_subProcessHandle, 1000 ) == WAIT_TIMEOUT )
        {
            TerminateProcess( m_subProcessHandle, 0 );
        }

        CloseHandle( m_subProcessHandle ),
        m_subProcessHandle = NULL;
    }

}






bool SubProcess::isRunning()
{
    return ( m_subProcessHandle && WaitForSingleObject( m_subProcessHandle, 500 ) == WAIT_TIMEOUT );
}
