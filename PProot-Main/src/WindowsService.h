/*
 * WindowsService.h - convenient class for using app as Windows service
 *
 *
 * Pris de iTalc
 *
 */


#ifndef WINDOWS_SERVICE_H
#define WINDOWS_SERVICE_H


#include <windows.h>
#include <wtsapi32.h>

#include <QtCore/QAtomicInt>
#include <QtCore/QString>

typedef BOOL(WINAPI *PFN_WTSQuerySessionInformation)( HANDLE, DWORD,
                    WTS_INFO_CLASS, LPTSTR*, DWORD* );
extern PFN_WTSQuerySessionInformation pfnWTSQuerySessionInformation;

typedef void(WINAPI *PFN_WTSFreeMemory)( PVOID );
extern PFN_WTSFreeMemory pfnWTSFreeMemory;


class WindowsService
{
public:
    WindowsService( const QString &serviceName,
                    const QString &serviceArg,
                    const QString &displayName,
                    const QString &serviceDependencies,
                    int argc,
                    char **argv );


    // install service - will start at next boot
    bool install();


    // unregister service
    bool remove();


    // re-install service
    bool reinstall()
    {
        return remove() && install();
    }


    // try to start service
    bool start();


    // try to stop service
    bool stop();


    // re-start service
    bool restart()
    {
        return stop() && start();
    }


    bool runAsService();


    bool evalArgs( int &argc, char **argv );


    inline int & argc()
    {
        return m_argc;
    }


    inline char **argv()
    {
        return m_argv;
    }




private:

    const QString m_name;
    const QString m_arg;
    const QString m_displayName;
    const QString m_dependencies;
    bool m_running;
    bool m_quiet;

    int m_argc;
    char **m_argv;


    static void WINAPI serviceMain( DWORD, char ** );
    static DWORD WINAPI serviceCtrl( DWORD _ctrlcode, DWORD dwEventType, LPVOID lpEventData, LPVOID lpContext );
    static bool reportStatus( DWORD state, DWORD exitCode, DWORD waitHint );

    static void monitorSessions();

    // we assume that a process won't contain more than one services
    // therefore we can make these members static
    static WindowsService *s_this;
    static SERVICE_STATUS s_status;
    static SERVICE_STATUS_HANDLE s_statusHandle;
    static HANDLE s_stopServiceEvent;
    static QAtomicInt s_sessionChangeEvent;

} ;




#endif  // WINDOWS_SERVICE_H

