/*
 *
 * Connexion au serveur via TCP socket
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#ifndef SOCKET_H
#define SOCKET_H


#include <QObject>
#include <QTcpSocket>
#include <QTimer>


class Socket : public QObject
{

    Q_OBJECT


public:

    Socket(QString host, int port, QObject *parent = 0);

    void send(QString type, QVariantMap data);

    bool isConnected();



public slots:

     void connectToServer();



private slots:

     void onConnected();

     void onDataAvailable();


     void onSocketError(QAbstractSocket::SocketError error);

     void onDisconnected();



signals:

    void cantConnect();

    void messageReceived(QString type, QMap<QString, QVariant> data);




private:

    QTcpSocket *m_socket;

    QString m_host;
    int m_port;

    QTimer *m_timer;


};



#endif // SOCKET_H
