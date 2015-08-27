/*
 *
 *  Fichier "fourre-tout" contenant des fonctions utiles
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */


#ifndef UTILS_H
#define UTILS_H


#include "windows.h"
#include <QString>


namespace Utils {



    // Convertie un LPCSTR en LPWSTR
    LPWSTR ConvertLPCSTRToLPWSTR (char* pCstring);

    // Convertir un LPWSTR en LPSTR
    char* ConvertLPWSTRToLPSTR (LPWSTR lpwszStrIn);


    // Permet de savoir si on est sur win7 ou +, ou win XP
    bool IsWin7OrLater();


    // Obtient le chemein dans lequel est le programme
    QString getCurrentPath();

}



#endif // UTILS_H
