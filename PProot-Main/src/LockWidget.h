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


#ifndef LOCKWIDGET_H
#define LOCKWIDGET_H


#include <QObject>
#include <QWidget>
#include <QTimer>

#include "SystemKeyTrapper.h"

#include <QPushButton>


class LockWidget : public QWidget
{
    Q_OBJECT


public:


    LockWidget();
    virtual ~LockWidget();

    void unactive();
    void active();

    void allowUserInput(bool value);


private slots:

    void onTimerFS();



private:

    virtual void showEvent(QShowEvent *);
    virtual void hideEvent(QHideEvent *);


    SystemKeyTrapper m_sysKeyTrapper;

    QTimer timerFS;


};


#endif // LOCKWIDGET_H
