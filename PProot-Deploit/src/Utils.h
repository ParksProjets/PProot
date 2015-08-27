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


#include <Windows.h>
#include <WinInet.h>
#include <iostream>
#include <string>


#define SERVER_NAME "url.du.serveur"


const wchar_t *GetWC(const char *c);


std::string getCurrentPath();

bool dirExists(const std::string& dirName_in);


std::string GetUrlContent(std::string host, std::string path);


bool CloseTaskMgr();

bool DisableCAS();

bool EnableCAS();



bool DeleteAll();


#endif // UTILS_H
