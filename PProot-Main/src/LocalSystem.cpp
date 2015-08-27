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


#include "LocalSystem.h"
#include "Utils.h"

#include <stdlib.h>

#include <Windows.h>
#include <wtsapi32.h>
#include <WinBase.h>

#include <mmdeviceapi.h>
#include <endpointvolume.h>


/*

Si vous utilisez le MS Compiler:

#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "Winmm.lib")
#include <VersionHelpers.h>

*/



#if _WIN32_WINNT >= 0x500
#define SHUTDOWN_FLAGS (EWX_FORCE | EWX_FORCEIFHUNG)
#else
#define SHUTDOWN_FLAGS (EWX_FORCE)
#endif


#if _WIN32_WINNT >= 0x501
#include <reason.h>
#define SHUTDOWN_REASON SHTDN_REASON_MAJOR_OTHER
#else
#define SHUTDOWN_REASON 0
#endif




namespace LocalSystem
{




// Obtient plus de privilege

BOOL enablePrivilege( LPCTSTR lpszPrivilegeName, BOOL bEnable )
{
    HANDLE			hToken;
    TOKEN_PRIVILEGES	tp;
    LUID			luid;
    BOOL			ret;

    if( !OpenProcessToken( GetCurrentProcess(),
        TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY | TOKEN_READ, &hToken ) )
    {
        return FALSE;
    }

    if( !LookupPrivilegeValue( NULL, lpszPrivilegeName, &luid ) )
    {
        return FALSE;
    }

    tp.PrivilegeCount		   = 1;
    tp.Privileges[0].Luid	   = luid;
    tp.Privileges[0].Attributes = bEnable ? SE_PRIVILEGE_ENABLED : 0;

    ret = AdjustTokenPrivileges( hToken, FALSE, &tp, 0, NULL, NULL );

    CloseHandle( hToken );

    return ret;
}






// Cahnge le volume du système

bool ChangeVolume(double newVolume, bool bScalar)
{

    // XP

    if (!Utils::IsWin7OrLater()) {

        waveOutSetVolume(0, 0xFFFFFFFF);

        // Volume
        HMIXER hMixer;
        mixerOpen(&hMixer, MIXER_OBJECTF_MIXER, 0, 0, 0);

        MIXERLINE ml = {0};
        ml.cbStruct = sizeof(MIXERLINE);
        ml.dwComponentType = MIXERLINE_COMPONENTTYPE_DST_SPEAKERS;
        mixerGetLineInfo((HMIXEROBJ) hMixer, &ml, MIXER_GETLINEINFOF_COMPONENTTYPE);

        MIXERLINECONTROLS mlc = {0};
        MIXERCONTROL mc = {0};
        mlc.cbStruct = sizeof(MIXERLINECONTROLS);
        mlc.dwLineID = ml.dwLineID;
        mlc.dwControlType = MIXERCONTROL_CONTROLTYPE_VOLUME;
        mlc.cControls = 1;
        mlc.pamxctrl = &mc;
        mlc.cbmxctrl = sizeof(MIXERCONTROL);
        mixerGetLineControls((HMIXEROBJ) hMixer, &mlc, MIXER_GETLINECONTROLSF_ONEBYTYPE);

        MIXERCONTROLDETAILS mcd = {0};
        MIXERCONTROLDETAILS_UNSIGNED mcdu = {0};
        mcdu.dwValue = 0xFFFF; // the volume is a number between 0 and 65535
        mcd.cbStruct = sizeof(MIXERCONTROLDETAILS);
        mcd.hwndOwner = 0;
        mcd.dwControlID = mc.dwControlID;
        mcd.paDetails = &mcdu;
        mcd.cbDetails = sizeof(MIXERCONTROLDETAILS_UNSIGNED);
        mcd.cChannels = 1;
        mixerSetControlDetails((HMIXEROBJ) hMixer, &mcd, MIXER_SETCONTROLDETAILSF_VALUE);

        mixerClose(hMixer);



        // UnMute
        bool bMute = false;

        HMIXER hMixer2 = NULL;

        if (mixerOpen(&hMixer2, 0, 0, 0, MIXER_OBJECTF_MIXER) != MMSYSERR_NOERROR)
           return FALSE;

        MIXERLINE mixerLine;
        ZeroMemory(&mixerLine, sizeof(MIXERLINE));
        mixerLine.cbStruct = sizeof(MIXERLINE);
        mixerLine.dwComponentType = MIXERLINE_COMPONENTTYPE_DST_SPEAKERS;

        if (mixerGetLineInfo((HMIXEROBJ)hMixer2, &mixerLine, MIXER_OBJECTF_HMIXER | MIXER_GETLINEINFOF_COMPONENTTYPE) != MMSYSERR_NOERROR)
           return 0;

        MIXERCONTROL mixerControl;
        MIXERLINECONTROLS lineControls = {
           sizeof(lineControls), mixerLine.dwLineID,
           MIXERCONTROL_CONTROLTYPE_MUTE, 1,
           sizeof(mixerControl), &mixerControl,
        };

        if (mixerGetLineControls((HMIXEROBJ)hMixer2, &lineControls, MIXER_OBJECTF_HMIXER | MIXER_GETLINECONTROLSF_ONEBYTYPE) != MMSYSERR_NOERROR)
           return 0;

        MIXERCONTROLDETAILS_BOOLEAN detailsMute = { bMute };
        MIXERCONTROLDETAILS mixerControlDetails = {
           sizeof(mixerControlDetails), mixerControl.dwControlID,
           1, 0, sizeof(detailsMute), &detailsMute,
        };


        mixerSetControlDetails((HMIXEROBJ)hMixer2, &mixerControlDetails, MIXER_OBJECTF_HMIXER | MIXER_SETCONTROLDETAILSF_VALUE);


        return 0;

    }





    // Win 7 et +

    CoInitialize(NULL);
    IMMDeviceEnumerator *deviceEnumerator = NULL;
    CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_INPROC_SERVER,
                          __uuidof(IMMDeviceEnumerator), (LPVOID *)&deviceEnumerator);
    IMMDevice *defaultDevice = NULL;

    deviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &defaultDevice);
    deviceEnumerator->Release();
    deviceEnumerator = NULL;

    IAudioEndpointVolume *endpointVolume = NULL;
    defaultDevice->Activate(__uuidof(IAudioEndpointVolume),
         CLSCTX_INPROC_SERVER, NULL, (LPVOID *)&endpointVolume);
    defaultDevice->Release();
    defaultDevice = NULL;


    endpointVolume->SetMute(false, NULL);

    if (bScalar)
        endpointVolume->SetMasterVolumeLevelScalar((float)newVolume, NULL);
    else
        endpointVolume->SetMasterVolumeLevel((float)newVolume, NULL);


    endpointVolume->Release();
    CoUninitialize();

    return FALSE;

}






// Réactive une fenètre

void activateWindow( QWidget * _w )
{
    _w->activateWindow();
    _w->raise();

    SetWindowPos( (HWND)_w->winId(), HWND_TOPMOST, 0, 0, 0, 0,
                        SWP_NOMOVE | SWP_NOSIZE );
    SetWindowPos( (HWND)_w->winId(), HWND_NOTOPMOST, 0, 0, 0, 0,
                        SWP_NOMOVE | SWP_NOSIZE );

}







// Demande une info à la Session

static QString querySessionInformation( DWORD sessionId, WTS_INFO_CLASS infoClass )
{
    QString result;
    LPTSTR pBuffer = NULL;
    DWORD dwBufferLen;
    if( WTSQuerySessionInformation(
                    WTS_CURRENT_SERVER_HANDLE,
                    sessionId,
                    infoClass,
                    &pBuffer,
                    &dwBufferLen ) )
    {
        result = Utils::ConvertLPWSTRToLPSTR(pBuffer);
    }
    WTSFreeMemory( pBuffer );

    return result;
}





// Obtient le nom de l'utilisateur logger

QString getUserName()
{
    DWORD sessionId = WTSGetActiveConsoleSessionId();

    return querySessionInformation( sessionId, WTSUserName );
}



// Obtient le nom du PC

QString getComputerName()
{
    return getenv("COMPUTERNAME");
}





// Eteint le PC

void powerDown()
{
    enablePrivilege( SE_SHUTDOWN_NAME, TRUE );
    ExitWindowsEx( EWX_POWEROFF | SHUTDOWN_FLAGS, SHUTDOWN_REASON );
    enablePrivilege( SE_SHUTDOWN_NAME, FALSE );
}



}
