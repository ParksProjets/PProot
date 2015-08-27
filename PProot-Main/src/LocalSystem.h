/*
 *
 * LocalSystem: fonctions intéragissantes avec le PC
 *
 *
 * Pris de iTALC (en parti)
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */



#ifndef LOCALSYSTEM_H
#define LOCALSYSTEM_H


#include <QWidget>

#ifndef __wtypes_h__
#include <wtypes.h>
#endif

#ifndef __WINDEF_
#include <windef.h>
#endif


#define QDTNS(x)	QDir::toNativeSeparators(x)

class QWidget;



namespace LocalSystem
{

    // Obtient plus de privilege
    BOOL enablePrivilege( LPCTSTR lpszPrivilegeName, BOOL bEnable );


    // Cahnge le volume du système
    bool ChangeVolume(double newVolume, bool bScalar);


    // Réactive une fenètre
    void activateWindow( QWidget * _window );


    // Obtient le nom de l'utilisateur logger
    QString getUserName();

    // Obtient le nom du PC
    QString getComputerName();


    // Eteint le PC
    void powerDown();

}



#endif // LOCALSYSTEM_H
