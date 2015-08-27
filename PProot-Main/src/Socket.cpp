/*
 *
 * Connexion au serveur via TCP socket
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#include "Socket.h"
#include "LocalSystem.h"

#include <QJsonDocument>
#include <QDebug>


Socket::Socket(QString host, int port, QObject *parent) :
    QObject(parent),
    m_host(host),
    m_port(port)
{


    // Timer

    m_timer = new QTimer(this);
    m_timer->setSingleShot(true);

    connect(m_timer, &QTimer::timeout, this, &Socket::connectToServer);



    // Socket

    m_socket = new QTcpSocket(this);

    connect(m_socket, &QTcpSocket::connected, this, &Socket::onConnected);
    connect(m_socket, &QTcpSocket::disconnected, this, &Socket::onDisconnected);

    connect(m_socket, &QTcpSocket::readyRead, this, &Socket::onDataAvailable);
    connect(m_socket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(onSocketError(QAbstractSocket::SocketError)));

}




void Socket::connectToServer()
{
    m_timer->stop();
    m_socket->connectToHost(m_host, m_port);
}






void Socket::onSocketError(QAbstractSocket::SocketError error)
{

    m_timer->start(10000);
    emit cantConnect();
}



void Socket::onDisconnected()
{
    m_timer->start(10000);
}





bool Socket::isConnected()
{
    return m_socket->isOpen();
}







// Data


void Socket::send(QString type, QVariantMap data)
{
    data.insert("type", type);

    QJsonDocument d = QJsonDocument::fromVariant(data);
    m_socket->write(d.toJson());
}




void Socket::onConnected()
{

    QVariantMap data;

    data.insert("nameUser", LocalSystem::getUserName());
    data.insert("namePC", LocalSystem::getComputerName());

    send("infos", data);
}




void Socket::onDataAvailable()
{

    QByteArray data = m_socket->readAll();
    QJsonDocument d = QJsonDocument::fromJson(data);

    QVariantMap obj = d.toVariant().toMap();

    QString type = obj.take("type").toString();
    emit messageReceived(type, obj);

}
