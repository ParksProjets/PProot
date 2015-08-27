/*
 *
 * Connexion au serveur via Websocket
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#ifndef WEBSOCKET_H
#define WEBSOCKET_H


#include <QObject>
#include <QtWebSockets/QWebSocket>
#include <QTimer>


class WebSocket : public QObject
{

     Q_OBJECT

public:

    WebSocket(const QUrl &url, QObject *parent = 0);

    void send(const QString &type, QVariantMap data);

    bool isConnected();



public slots:

     void connectToServer();



private slots:

    void onConnected();

    void onDataAvailable(const QString &message);


    void onSocketError(QAbstractSocket::SocketError error);

    void onDisconnected();


    void giveInfos();



signals:

    void cantConnect();

    void messageReceived(QString type, QVariantMap data);



private:

    QWebSocket m_webSocket;

    QUrl m_url;

    QTimer *m_timer;

    QTimer *m_timerInfo;


    QString user;
    QString pc;


};



#endif // WEBSOCKET_H
