/*
 *
 * Classe principale
 *
 *
 * © 2015 - Guillaume Gonnet
 */


#ifndef APP_H
#define APP_H


#include <QObject>
#include <QApplication>

#include "Socket.h"
#include "WebSocket.h"

#include "LockWidget.h"
#include "GraphicManager.h"


class GraphicManager;


class App : public QObject
{

    Q_OBJECT


public:

    explicit App(QObject *parent = 0);
    ~App();


    Socket *socket;
    WebSocket *websocket;



public slots:

    void startFullScreen();
    void stopFullScreen();

    void shutdown();



private slots:

    void onMessage(QString type, QVariantMap data);

    void restartFS();





private:

    LockWidget *lockWin;
    bool allowUserInput;

    GraphicManager *graphic;

    
};



#endif // APP_H
