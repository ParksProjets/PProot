/*
 *
 *  Fonctions pour télécharger des fichiers
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */


#ifndef FILESDOWNLOAD_H
#define FILESDOWNLOAD_H



#include <string>
#include <vector>
#include <windows.h>


using namespace std;



class FilesDownload
{


public:

    FilesDownload(string url);

    bool run();



private:

    bool downloadList();

    bool dirExists(const string &dirName);


    string host;

    string path;

};




#endif // FILESDOWNLOAD_H
