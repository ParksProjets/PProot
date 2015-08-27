/*
 *
 * Fichier principal
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */



/*

Bienvenu dans le code source de PProot !

PProot est sous license GPLv2 (+ d'info ici: http://www.gnu.org/licenses/gpl-2.0.html).
Vous pouvez ainsi reprendre une partie du code source pour une autre applcation sous même license.

Utilisez ces sources sans modération !


© 2015 - Guillaume Gonnet

*/




#include <QApplication>
#include "App.h"


int main(int argc, char *argv[])
{


    QApplication a(argc, argv);


    // Empêche la fermeture du programme quand la derniere fenêtre se ferme
    a.setQuitOnLastWindowClosed(false);



    App app;

    return a.exec();

}
