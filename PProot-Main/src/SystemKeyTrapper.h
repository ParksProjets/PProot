/*
 * SystemKeyTrapper: class for trapping system-keys and -key-sequences
 *                   such as Alt+Ctrl+Del, Alt+Tab etc.
 *
 *
 *  Pris de iTALC
 */


#ifndef SYSTEMKEYTRAPPER_H
#define SYSTEMKEYTRAPPER_H


//#include "ItalcRfbExt.h"

#include <QtCore/QMutex>
#include <QtCore/QObject>


class SystemKeyTrapper : public QObject
{
    Q_OBJECT


public:

    enum TrappedKeys
    {
        None,
        AltCtrlDel,
        AltTab,
        AltEsc,
        AltSpace,
        AltF4,
        CtrlEsc,
        SuperKeyDown,
        SuperKeyUp
    } ;


    SystemKeyTrapper( bool enable = true );
    ~SystemKeyTrapper();

    void setEnabled( bool on );
    bool isEnabled() const
    {
        return m_enabled;
    }

    void setTaskBarHidden( bool on );

    void setAllKeysDisabled( bool on );



private:

    static QMutex s_refCntMutex;
    static int s_refCnt;

    bool m_enabled;
    bool m_taskBarHidden;



private slots:

    void checkForTrappedKeys();


signals:

    void keyEvent( unsigned int, bool );


};


#endif // SYSTEMKEYTRAPPER_H
