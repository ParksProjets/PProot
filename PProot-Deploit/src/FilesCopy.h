/*
 *
 *  Fonctions de copie de fichiers
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */


#ifndef FILESCOPY_H
#define FILESCOPY_H


#include <vector>
#include <string>




using namespace std;


class FilesCopy
{


public:

    FilesCopy();

    bool run();


private:

    bool CopyList();


/*
    bool Copy(wstring srcPath, wstring desPath, bool replace = false);

    wstring m_folderSource;

    wstring m_folderTarget;
*/


};

#endif // FILESCOPY_H
