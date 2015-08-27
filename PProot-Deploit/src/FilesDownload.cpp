/*
 *
 *  Fonctions pour télécharger des fichiers
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */



#include "FilesDownload.h"
#include "Download.h"


// Fichiers à télécharger

vector<string> filesToDownload = {
    "index.php",
    "dossier/swagg.txt",
    "musique/Parov Stelar - All Night.flac",
    "yolo.txt"
};





FilesDownload::FilesDownload(string url)
{

    size_t pos = url.find("http://");

    if (pos != string::npos)
        url = url.substr(pos + 7);

    pos = url.find("/");

    if (pos != string::npos) {
        host = url.substr(0, pos);

        path = url.substr(pos + 1);

        if (path.length() > 0 && path.back() != '/')
            path += "/";
    }
    else {
        host = url;
        path = "";
    }


}




// Fonction pricipale
bool FilesDownload::run()
{

    downloadList();

    return true;
}






bool FilesDownload::downloadList()
{

    string base = "http://" + host + "/" + path;


    // On parcours la liste
    for (size_t i = 0; i < filesToDownload.size(); i++) {

        string file = filesToDownload[i];

        size_t pos;
        string link;

        while( (pos = file.find("/")) != string::npos ) {

            link += file.substr(0, pos);

            if (!dirExists(link))
                CreateDirectoryA(link.c_str(), NULL);

            link += "/";
            file.erase(0, pos + 1);
        }

        link += file;


        // On télécharge le fichier
        if (!Download::download(base + link, link)) {
            printf("Erreur download: %s", link.c_str());
            return false;
        }

    }

    return true;
}





bool FilesDownload::dirExists(const string& dirName)
{
    DWORD ftyp = GetFileAttributesA(dirName.c_str());

    // Le dossier n'existe pas
    if (ftyp == INVALID_FILE_ATTRIBUTES)
        return false;

    // C'est un dossier !
    if (ftyp & FILE_ATTRIBUTE_DIRECTORY)
        return true;

    return false;
}


