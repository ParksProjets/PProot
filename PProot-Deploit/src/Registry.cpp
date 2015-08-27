/*
 *
 *  Gestion du Registre
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "Registry.h"



namespace Registry
{




// Créer la clé de registre confirmant que PProot est bien installé

void create()
{

    DWORD val = 1;

    HKEY hKey;
    DWORD dwDisposition;

    if (RegCreateKeyEx(
            HKEY_LOCAL_MACHINE,
            REG_PATH,
            0, NULL, 0,
            KEY_WRITE, NULL,
            &hKey, &dwDisposition
        ) == ERROR_SUCCESS)
    {

        long setRes = RegSetValueEx (hKey, L"copy", 0, REG_DWORD, (BYTE*)&val, sizeof(val));
        RegCloseKey(hKey);
    }

}






// Supprime le registre de PProot

bool remove()
{

    HKEY hkey = NULL;

    if (RegOpenKeyEx( HKEY_LOCAL_MACHINE, REG_PATH, 0, KEY_READ | KEY_WRITE, &hkey) != ERROR_SUCCESS)
        return false;

    bool success = Registry::RegRemoveSubkeys(hkey);
    RegCloseKey(hkey);

    if (!success)
        return false;

    if (RegDeleteKey(HKEY_LOCAL_MACHINE, REG_PATH) != ERROR_SUCCESS)
        return false;


    return true;
}





// Récupère un DWORD du registre

DWORD getDWORDValue(wstring key)
{

    HKEY hKey;
    if (RegOpenKeyExW(HKEY_LOCAL_MACHINE, REG_PATH, 0, KEY_READ, &hKey) != ERROR_SUCCESS)
        return 0;

    DWORD dwBufferSize(sizeof(DWORD));
    DWORD nResult(0);

    if (RegQueryValueEx(hKey, key.c_str(), 0, NULL, reinterpret_cast<LPBYTE>(&nResult), &dwBufferSize) != ERROR_SUCCESS)
        return 0;

    return nResult;

}






// Enlève toute les clé d'un registre (sans le supprimer)

bool RegRemoveSubkeys(HKEY hRegKey)
{

    WCHAR Name[256];
    DWORD dwNameSize;
    FILETIME ftLastWrite;
    HKEY hSubKey;
    bool Success;

    for (;;)
    { // infinite loop
        dwNameSize=255;
        if (RegEnumKeyEx(hRegKey, 0, Name, &dwNameSize, NULL, NULL, NULL, &ftLastWrite) == ERROR_NO_MORE_ITEMS)
            break;
        if (RegOpenKeyEx(hRegKey, Name, 0, KEY_READ, &hSubKey) != ERROR_SUCCESS)
            return false;

        Success=RegRemoveSubkeys(hSubKey);
        RegCloseKey(hSubKey);
        if (!Success)
            return false;
        else if (RegDeleteKey(hRegKey, Name) != ERROR_SUCCESS)
            return false;
    }
    return true;
}




}
