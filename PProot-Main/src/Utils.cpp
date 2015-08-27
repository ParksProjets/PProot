/*
 *
 *  Fichier "fourre-tout" contenant des fonctions utiles
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "Utils.h"


namespace Utils {




// Convertie un LPCSTR en LPWSTR

LPWSTR ConvertLPCSTRToLPWSTR (char* pCstring)
{

    LPWSTR pszOut = NULL;

    if (pCstring != NULL) {

        int nInputStrLen = strlen (pCstring);

        // Double NULL Termination
        int nOutputStrLen = MultiByteToWideChar(CP_ACP, 0, pCstring, nInputStrLen, NULL, 0) + 2;
        pszOut = new WCHAR [nOutputStrLen];

        if (pszOut) {

            memset (pszOut, 0x00, sizeof (WCHAR)*nOutputStrLen);
            MultiByteToWideChar (CP_ACP, 0, pCstring, nInputStrLen, pszOut, nInputStrLen);
        }
    }

    return pszOut;

}





// Convertir un LPWSTR en LPSTR

char* ConvertLPWSTRToLPSTR (LPWSTR lpwszStrIn)
{

    LPSTR pszOut = NULL;

    if (lpwszStrIn != NULL) {

        int nInputStrLen = wcslen (lpwszStrIn);

        // Double NULL Termination
        int nOutputStrLen = WideCharToMultiByte (CP_ACP, 0, lpwszStrIn, nInputStrLen, NULL, 0, 0, 0) + 2;
        pszOut = new char [nOutputStrLen];

        if (pszOut) {

            memset (pszOut, 0x00, nOutputStrLen);
            WideCharToMultiByte(CP_ACP, 0, lpwszStrIn, nInputStrLen, pszOut, nOutputStrLen, 0, 0);
        }
    }

    return pszOut;
}





// Permet de savoir si on est sur win7 ou +, ou win XP

bool IsWin7OrLater() {
    DWORD version = GetVersion();
    DWORD major = (DWORD) (LOBYTE(LOWORD(version)));
    DWORD minor = (DWORD) (HIBYTE(LOWORD(version)));

    return (major > 6) || ((major == 6) && (minor >= 1));
}






// Obtient le chemein dans lequel est le programme

QString getCurrentPath()
{

    HMODULE hModule = GetModuleHandleW(NULL);
    WCHAR wpath[MAX_PATH];
    GetModuleFileNameW(hModule, wpath, MAX_PATH);


    QString path = QString::fromWCharArray(wpath);

    int i = path.lastIndexOf("/");
    if (i == -1)
        i = path.lastIndexOf("\\");

    if (i >= 0)
        return path.left(i + 1);
    else
        return path;
}





}
