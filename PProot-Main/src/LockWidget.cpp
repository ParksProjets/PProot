/*
 *
 * LockWidget: fenètre bloquant le PC
 *
 *
 * Pris de iTALC (en parti)
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */



#include <windows.h>

#include "LockWidget.h"
#include "LocalSystem.h"

#include <QApplication>
#include <QDesktopWidget>




// /!\ Important: Doit être définit avant #include <windows.h>
#define WIN32_LEAN_AND_MEAN

#include <windows.h>


static const UINT __ss_get_list[] = {
    SPI_GETLOWPOWERTIMEOUT,
    SPI_GETPOWEROFFTIMEOUT,
    SPI_GETSCREENSAVETIMEOUT
};

static const UINT __ss_set_list[] = {
    SPI_SETLOWPOWERTIMEOUT,
    SPI_SETPOWEROFFTIMEOUT,
    SPI_SETSCREENSAVETIMEOUT
};

static int __ss_val[3];



LockWidget::LockWidget() :
    QWidget(),  // Pour Linux: QWidget( Qt::X11BypassWindowManagerHint ),
    m_sysKeyTrapper(),
    timerFS(this)
{


    // Timer pour full screen
    connect(&timerFS, &QTimer::timeout, this, &LockWidget::onTimerFS);
    timerFS.setInterval(100);
    timerFS.start();


    setWindowState(Qt::WindowMinimized);
    setWindowState(Qt::WindowActive);

    setWindowTitle("PProot Lock");

    showFullScreen();

    move( 0, 0 );
    setFixedSize( qApp->desktop()->size() );


    // Blocage du clavier
    LocalSystem::activateWindow( this );

    setFocusPolicy( Qt::StrongFocus );
    setFocus();


    active();
}






void LockWidget::active()
{

    m_sysKeyTrapper.setAllKeysDisabled( true );
    m_sysKeyTrapper.setTaskBarHidden( true );

    // Disable screensaver
    for( int x = 0; x < 3; ++x ) {
        SystemParametersInfo( __ss_get_list[x], 0, &__ss_val[x], 0 );
        SystemParametersInfo( __ss_set_list[x], 0, NULL, 0 );
    }

}





void LockWidget::unactive()
{
    // Revert screensaver-settings
    for( int x = 0; x < 3; ++x ) {
        SystemParametersInfo( __ss_set_list[x], __ss_val[x], NULL, 0 );
    }

    m_sysKeyTrapper.setAllKeysDisabled( false );
}





// Active / Désactive le clavier et la souris

void LockWidget::allowUserInput(bool value)
{

    unsetCursor();
    QApplication::restoreOverrideCursor();


    if (!value) {
        grabMouse();
        grabKeyboard();

        setCursor( Qt::BlankCursor );
        QApplication::setOverrideCursor(Qt::BlankCursor);
        m_sysKeyTrapper.setAllKeysDisabled( true );
    }

    else {
        releaseMouse();
        releaseKeyboard();

        m_sysKeyTrapper.setAllKeysDisabled( false );
    }
}





LockWidget::~LockWidget()
{
    unactive();
}







// Garde le focus sur la fenètre

void LockWidget::onTimerFS()
{

    LocalSystem::activateWindow( this );
    m_sysKeyTrapper.setTaskBarHidden( true );

}





// Event: quand la fenètre devient visible

void LockWidget::showEvent(QShowEvent *)
{
    LocalSystem::activateWindow( this );
    active();
    timerFS.start();
}





// Event: quand la fenètre n'est plus visible

void LockWidget::hideEvent(QHideEvent *)
{
    unactive();
    timerFS.stop();
}

