/*
 * SystemKeyTrapper: class for trapping system-keys and -key-sequences
 *                   such as Alt+Ctrl+Del, Alt+Tab etc.
 *
 *
 *  Pris de iTALC
 */



#define _WIN32_WINNT 0x0500 // for KBDLLHOOKSTRUCT

#include <windows.h>

#include "Inject.h"


#define XK_KOREAN
#include "rfb/keysym.h"
#include "SystemKeyTrapper.h"

#include <QtCore/QList>
#include <QtCore/QProcess>
#include <QtCore/QTimer>

static QMutex __trapped_keys_mutex;
static QList<SystemKeyTrapper::TrappedKeys> __trapped_keys;
static bool __disable_all_keys = false;

QMutex SystemKeyTrapper::s_refCntMutex;
int SystemKeyTrapper::s_refCnt = 0;



// some code for disabling system's hotkeys such as Alt+Ctrl+Del, Alt+Tab,
// Ctrl+Esc, Alt+Esc, Windows-key etc. - otherwise locking wouldn't be very
// effective... ;-)


HHOOK g_hHookKbdLL = NULL; // hook handle


LRESULT CALLBACK TaskKeyHookLL( int nCode, WPARAM wp, LPARAM lp )
{
    KBDLLHOOKSTRUCT *pkh = (KBDLLHOOKSTRUCT *) lp;
    static QList<SystemKeyTrapper::TrappedKeys> pressed;
    if( nCode == HC_ACTION )
    {
        BOOL bCtrlKeyDown = GetAsyncKeyState( VK_CONTROL ) >>
                        ( ( sizeof( SHORT ) * 8 ) - 1 );
        QMutexLocker m( &__trapped_keys_mutex );

        SystemKeyTrapper::TrappedKeys key = SystemKeyTrapper::None;
        if( pkh->vkCode == VK_ESCAPE && bCtrlKeyDown )
        {
            key = SystemKeyTrapper::CtrlEsc;
        }
        else if( pkh->vkCode == VK_TAB && pkh->flags & LLKHF_ALTDOWN )
        {
            key = SystemKeyTrapper::AltTab;
        }
        else if( pkh->vkCode == VK_ESCAPE &&
                        pkh->flags & LLKHF_ALTDOWN )
        {
            key = SystemKeyTrapper::AltEsc;
        }
        else if( pkh->vkCode == VK_SPACE && pkh->flags & LLKHF_ALTDOWN )
        {
            key = SystemKeyTrapper::AltSpace;
        }
        else if( pkh->vkCode == VK_F4 && pkh->flags & LLKHF_ALTDOWN )
        {
            key = SystemKeyTrapper::AltF4;
        }
        else if( pkh->vkCode == VK_LWIN || pkh->vkCode == VK_RWIN )
        {
            pressed.removeAll( SystemKeyTrapper::SuperKeyDown );
            pressed.removeAll( SystemKeyTrapper::SuperKeyUp );
            if( wp == WM_KEYDOWN )
            {
                key = SystemKeyTrapper::SuperKeyDown;
            }
            else
            {
                key = SystemKeyTrapper::SuperKeyUp;
            }
        }
        else if( pkh->vkCode == VK_DELETE && bCtrlKeyDown &&
                        pkh->flags && LLKHF_ALTDOWN )
        {
            key = SystemKeyTrapper::AltCtrlDel;
        }
        if( key != SystemKeyTrapper::None )
        {
            if( !pressed.contains( key ) )
            {
                __trapped_keys.push_back( key );
                pressed << key;
            }
            else
            {
                pressed.removeAll( key );
            }
            return 1;
        }
        if( __disable_all_keys )
        {
            return 1;
        }
    }
    return CallNextHookEx( g_hHookKbdLL, nCode, wp, lp );
}




static STICKYKEYS settings_sk = { sizeof( STICKYKEYS ), 0 };
static TOGGLEKEYS settings_tk = { sizeof( TOGGLEKEYS ), 0 };
static FILTERKEYS settings_fk = { sizeof( FILTERKEYS ), 0 };


void enableStickyKeys( bool _enable )
{
    if( _enable )
    {
        SystemParametersInfo( SPI_SETSTICKYKEYS, sizeof( STICKYKEYS ),
                            &settings_sk, 0 );
        SystemParametersInfo( SPI_SETTOGGLEKEYS, sizeof( TOGGLEKEYS ),
                            &settings_tk, 0 );
        SystemParametersInfo( SPI_SETFILTERKEYS, sizeof( FILTERKEYS ),
                            &settings_fk, 0 );
    }
    else
    {
        SystemParametersInfo( SPI_GETSTICKYKEYS, sizeof( STICKYKEYS ),
                            &settings_sk, 0 );
        SystemParametersInfo( SPI_GETTOGGLEKEYS, sizeof( TOGGLEKEYS ),
                            &settings_tk, 0 );
        SystemParametersInfo( SPI_GETFILTERKEYS, sizeof( FILTERKEYS ),
                            &settings_fk, 0 );

        STICKYKEYS skOff = settings_sk;
        skOff.dwFlags &= ~SKF_HOTKEYACTIVE;
        skOff.dwFlags &= ~SKF_CONFIRMHOTKEY;
        SystemParametersInfo( SPI_SETSTICKYKEYS, sizeof( STICKYKEYS ),
                                &skOff, 0 );

        TOGGLEKEYS tkOff = settings_tk;
        tkOff.dwFlags &= ~TKF_HOTKEYACTIVE;
        tkOff.dwFlags &= ~TKF_CONFIRMHOTKEY;
        SystemParametersInfo( SPI_SETTOGGLEKEYS, sizeof( TOGGLEKEYS ),
                                &tkOff, 0 );

        FILTERKEYS fkOff = settings_fk;
        fkOff.dwFlags &= ~FKF_HOTKEYACTIVE;
        fkOff.dwFlags &= ~FKF_CONFIRMHOTKEY;
        SystemParametersInfo( SPI_SETFILTERKEYS, sizeof( FILTERKEYS ),
                                &fkOff, 0 );
    }
}



SystemKeyTrapper::SystemKeyTrapper( bool _enabled ) :
    QObject(),
    m_enabled( false ),
    m_taskBarHidden( false )
{
    setEnabled( _enabled );
}




SystemKeyTrapper::~SystemKeyTrapper()
{
    setEnabled( false );
    if( m_taskBarHidden )
    {
        setTaskBarHidden( false );
    }
}




void SystemKeyTrapper::setTaskBarHidden( bool on )
{
    m_taskBarHidden = on;

    if( on )
    {
        EnableWindow( FindWindow( L"Shell_traywnd", NULL ), false );
        //ShowWindow( FindWindow( "Shell_traywnd", NULL ), SW_HIDE );
    }
    else
    {
        EnableWindow( FindWindow( L"Shell_traywnd", NULL ), true );
        // causes hang on Win7
        //ShowWindow( FindWindow( "Shell_traywnd", NULL ), SW_NORMAL );
    }

}




void SystemKeyTrapper::setEnabled( bool on )
{
    if( on == m_enabled )
    {
        return;
    }

    s_refCntMutex.lock();

    m_enabled = on;
    if( on )
    {

        if( !s_refCnt )
        {
            if( !g_hHookKbdLL )
            {
                HINSTANCE hAppInstance =
                            GetModuleHandle( NULL );
                // set lowlevel-keyboard-hook
                g_hHookKbdLL =
                    SetWindowsHookEx( WH_KEYBOARD_LL,
                                TaskKeyHookLL,
                                hAppInstance,
                                0 );
            }

            enableStickyKeys( false );

            if( !Inject() )
            {
                qWarning( "SystemKeyTrapper: Inject() failed");
            }
        }

        QTimer * t = new QTimer( this );
        connect( t, SIGNAL( timeout() ),
                    this, SLOT( checkForTrappedKeys() ) );
        t->start( 10 );

        ++s_refCnt;
    }
    else
    {
        --s_refCnt;

        if( !s_refCnt )
        {
            UnhookWindowsHookEx( g_hHookKbdLL );
            g_hHookKbdLL = NULL;

            if( !Eject() )
            {
                qWarning( "SystemKeyTrapper: Eject() failed");
            }

            enableStickyKeys( true );
        }

    }
    s_refCntMutex.unlock();
}




void SystemKeyTrapper::setAllKeysDisabled( bool on )
{
    __disable_all_keys = on;
}




void SystemKeyTrapper::checkForTrappedKeys()
{
    QMutexLocker m( &__trapped_keys_mutex );

    while( !__trapped_keys.isEmpty() )
    {
        unsigned int key = 0;
        bool toggle = true;
        bool stateToSet = false;
        switch( __trapped_keys.front() )
        {
            case None: break;
            case AltCtrlDel: key = XK_Delete; break;
            case AltTab: key = XK_Tab; break;
            case AltEsc: key = XK_Escape; break;
            case AltSpace: key = XK_KP_Space; break;
            case AltF4: key = XK_F4; break;
            case CtrlEsc: key = XK_Escape; break;
            case SuperKeyDown: key = XK_Super_L; toggle = false; stateToSet = true; break;
            case SuperKeyUp: key = XK_Super_L; toggle = false; stateToSet = false; break;
        }

        if( key )
        {
            if( toggle )
            {
                emit keyEvent( key, true );
                emit keyEvent( key, false );
            }
            else
            {
                emit keyEvent( key, stateToSet );
            }
        }

        __trapped_keys.removeFirst();

    }
}
