/*
 *
 *  Fonctions de copie de fichiers
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */




#include "FilesCopy.h"
#include "Utils.h"
#include <windows.h>
#include <stdio.h>
#include <algorithm>



//#define SRC_PPROOT "\\\\192.168.220.10\\wpkg\\softwares\\"
#define SRC_PPROOT "\\\\192.168.220.10\\wpkg\\softwares\\CDSPID\\Static\\i386\\"



// Liste de fichiers à copier
/*
vector<string> filesToCopy = {
    "Maths.html",
    "Epic Sax Guy.mp3",
    "Qt5Core.dll",
    "Qt5Multimedia.dll",
    "mediaservice\\dsengine.dll",
    "mediaservice\\qtmedia_audioengine.dll",
    "mediaservice\\Lol\\Oh Yeah! .mp3",
    "Swagg lol\\Oh Yeah! .mp3"
};
*/

vector<string> filesToCopy = {
    "pr.exe"
};





FilesCopy::FilesCopy() {}




// Démarre la copie

bool FilesCopy::run()
{
    return CopyList();
}





// Copie la liste de fichiers

bool FilesCopy::CopyList() {


    string base = getCurrentPath();


    // On parcours la liste
    for (size_t i = 0; i < filesToCopy.size(); i++) {

        string file = filesToCopy[i];

        size_t pos;
        string link;

        while( (pos = file.find("\\")) != string::npos ) {

            link += file.substr(0, pos);

            if (!dirExists(base + link))
                CreateDirectoryA((base + link).c_str(), NULL);

            link += "\\";
            file.erase(0, pos + 1);
        }

        link += file;


        if (!CopyFileA((string(SRC_PPROOT) + link).c_str(), (base + link).c_str(), false))
            return false;


    }

    return true;
}




/*

// Fonction de copy
bool FilesCopy::Copy(wstring srcPath, wstring desPath, bool replace) {


    WIN32_FIND_DATA FindFileData;
    memset(&FindFileData, 0, sizeof(WIN32_FIND_DATA));

    HANDLE handle = FindFirstFile(
        wstring(srcPath + L"*").c_str(),
        &FindFileData
    );


    if (handle == NULL)
        return false;

    do
    {

        if(FindFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
        {
            if (wcscmp(FindFileData.cFileName, L".") != 0 && wcscmp(FindFileData.cFileName, L"..") != 0)
            {
                printf("\nDirectory: ");
                wprintf(FindFileData.cFileName);

                wstring newSrcPath = srcPath + FindFileData.cFileName;
                wstring newDesPath = desPath + FindFileData.cFileName;

                CreateDirectory(newDesPath.c_str(), NULL);

                Copy(newSrcPath + L"\\", newDesPath + L"\\", replace);

            }
        }
        else
        {

            printf("\nFile: ");
            wprintf(FindFileData.cFileName);

            BOOL result = CopyFile(
                wstring(srcPath + FindFileData.cFileName).c_str(),
                wstring(desPath + FindFileData.cFileName).c_str(),
                !replace
            );
        }


      } while (FindNextFile(handle, &FindFileData));

      FindClose(handle);

      return true;
}

*/



