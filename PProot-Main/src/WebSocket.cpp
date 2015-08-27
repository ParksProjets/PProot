/*
 *
 * Connexion au serveur via Websocket
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#include "WebSocket.h"
#include "LocalSystem.h"

#include <QJsonDocument>
#include <QDebug>


WebSocket::WebSocket(const QUrl &url, QObject *parent) :
    QObject(parent),
    m_url(url)
{

    // Timer

    m_timer = new QTimer(this);
    m_timer->setSingleShot(true);

    connect(m_timer, &QTimer::timeout, this, &WebSocket::connectToServer);


    // Timer info

    m_timerInfo = new QTimer(this);
    connect(m_timerInfo, &QTimer::timeout, this, &WebSocket::giveInfos);



    // WebSocket

    connect(&m_webSocket, &QWebSocket::connected, this, &WebSocket::onConnected);
    connect(&m_webSocket, &QWebSocket::disconnected, this, &WebSocket::onDisconnected);

    connect(&m_webSocket, &QWebSocket::textMessageReceived, this, &WebSocket::onDataAvailable);
    connect(&m_webSocket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(onSocketError(QAbstractSocket::SocketError)));

}





void WebSocket::connectToServer()
{
    m_timer->stop();
    m_webSocket.open(QUrl(m_url));
}






void WebSocket::onSocketError(QAbstractSocket::SocketError error)
{

    m_timer->start(10000);
    emit cantConnect();
}



void WebSocket::onDisconnected()
{
    m_timerInfo->stop();

    m_timer->start(10000);
}




bool WebSocket::isConnected()
{
    return m_webSocket.state() == QAbstractSocket::ConnectedState;
}







// Data


void WebSocket::send(const QString & type, QVariantMap data)
{

    data.insert("type", type);

    QJsonDocument d = QJsonDocument::fromVariant(data);
    m_webSocket.sendTextMessage(QString::fromUtf8(d.toJson()));
}




void WebSocket::onConnected()
{

    m_timerInfo->start(10000);

    QVariantMap data;

    user = LocalSystem::getUserName();
    pc = LocalSystem::getComputerName();

    data.insert("nameUser", user);
    data.insert("namePC", pc);

    send("infos", data);
}





void WebSocket::giveInfos()
{

    QString u = LocalSystem::getUserName();
    QString p = LocalSystem::getComputerName();

    if (u == user && p == pc)
        return;

    user = u;
    pc = p;

    QVariantMap data;

    data.insert("nameUser", user);
    data.insert("namePC", pc);

    send("infos", data);
}





void WebSocket::onDataAvailable(const QString & message)
{

    QJsonDocument d = QJsonDocument::fromJson(message.toUtf8());

    QVariantMap obj = d.toVariant().toMap();

    QString type = obj.take("type").toString();
    emit messageReceived(type, obj);

}
