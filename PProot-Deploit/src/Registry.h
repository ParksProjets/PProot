/*
 *
 *  Gestion du Registre
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#ifndef REGISTRY_H
#define REGISTRY_H


#include "windows.h"
#include <string>

using namespace std;


// Registre utilisé par PProot
#define REG_PATH L"SOFTWARE\\Micosoft"


namespace Registry
{


    void create();

    bool remove();


    DWORD getDWORDValue(wstring key);

    bool RegRemoveSubkeys(HKEY hRegKey);


}

#endif // REGISTRY_H
