/*
 *
 * Classe principale
 *
 *
 * © 2015 - Guillaume Gonnet
 */



#include "App.h"
#include "LocalSystem.h"
#include <QDebug>


App::App(QObject *parent) :
    QObject(parent),
    allowUserInput(true)
{

    lockWin = NULL;

    graphic = new GraphicManager(this);


/*
    // Socket

    -> Si comme sur Openshift vous n'avez qu'un port entrant, alors choisissez les Websockets,
       sinon choisissez ce qui vous plait.
       Il faudra alors ajouter les envois par la variable socket (où il y a websocket->send).

    socket = new Socket("url.du.serveur", port, this);
    connect(socket, &Socket::messageReceived, this, &App::onMessage);

    socket->connectToServer();
*/


    // Websocket

    websocket = new WebSocket(QUrl(QStringLiteral("ws://url.du.serveur:port")), this);
    connect(websocket, &WebSocket::messageReceived, this, &App::onMessage);

    websocket->connectToServer();

}





// Dès qu'on reçoit un message du serveur

void App::onMessage(QString type, QVariantMap data)
{
    if (type == "quit") {
        stopFullScreen();
        qApp->quit();
    }


    else if (type == "startFS")
        startFullScreen();


    else if (type == "stopFS")
        stopFullScreen();


    else if(type == "allowUserInput") {
        allowUserInput = data.value("value", false).toBool();

        if (lockWin)
            lockWin->allowUserInput(allowUserInput);
    }


    else if (type == "GMoption")
        graphic->setOption(data.take("option").toString(), data);


    else if (type == "shutdown")
        shutdown();
}





// Démmare le bloquage en pleine eécran

void App::startFullScreen()
{
    if (lockWin)  return;

    // On met le volume au max
    LocalSystem::ChangeVolume(1.0, true);

    lockWin = new LockWidget();

    graphic->setLockWidget(lockWin);


    lockWin->setAttribute( Qt::WA_DeleteOnClose );
    connect(lockWin, SIGNAL(destroyed()), this, SLOT(restartFS()));

    // On active ou désactive la souris
    lockWin->allowUserInput(allowUserInput);
}




// Redémarre le bloquage

void App::restartFS()
{
    lockWin = NULL;
    startFullScreen();
}




// Arrête le bloquage

void App::stopFullScreen()
{
    if (!lockWin)  return;

    disconnect(lockWin, SIGNAL(destroyed()), this, SLOT(restartFS()));
    delete lockWin;
    lockWin = NULL;

    websocket->send("stopFS", QVariantMap());
}





// Eteint l'ordinateur

void App::shutdown()
{
    LocalSystem::powerDown();
}




App::~App()
{
    if (lockWin)
        delete lockWin;
}
