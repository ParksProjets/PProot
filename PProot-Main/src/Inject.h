/*
 * Inject.h - functions for injecting code into winlogon.exe for disabling
 *            SAS (Alt+Ctrl+Del)
 *
 *
 *  Pris de iTALC
 *
 */


#ifndef INJECT_H
#define INJECT_H


/*

Ces fonctions ne marchent pas la plupart du temps.
Il est très dur (voir impossible) de bloquer Ctrl+Alt+Suppr sans modifier un DLL de Windows,
ce qui est pas le but (je veux pas modifier le système)

En bloquant le Gestionnaire de Tâche, le fait que ces fonctions ne marchent pas n'est pas trop grave.
Mais :(

*/



#include <windows.h>

BOOL Inject( void );
BOOL Eject( void );


#endif // INJECT_H
