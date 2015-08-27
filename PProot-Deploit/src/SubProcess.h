/*
 *
 *  Classe gérant un autre processus (SubProcess)
 *
 *
 *  © 2015 - Guillaume Gonnet
 *  License GPLv2
 */


#ifndef SUBPROCESS_H
#define SUBPROCESS_H


#include <windows.h>
#include <string>

using namespace std;


class SubProcess
{


public:

    SubProcess(string name = "pr.exe");
    ~SubProcess();

    bool start();

    void stop();

    bool isRunning();



private:

    wstring m_name;

    HANDLE m_subProcessHandle;



};



#endif // SUBPROCESS_H
