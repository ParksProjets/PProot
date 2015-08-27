/*
 *
 *
 */


#include "GraphicsWeb.h"
#include "Utils.h"

#include <QPushButton>
#include <QWebFrame>
#include <QDebug>


GraphicsWeb::GraphicsWeb(QWidget *parent, App *a) : GraphicsParent(parent, a)
{

    view = new QWebView(this);

    connect(view->page()->mainFrame(), &QWebFrame::javaScriptWindowObjectCleared, this, &GraphicsWeb::addPProotToJS);
    connect(view, &QWebView::loadFinished, this, &GraphicsWeb::finishLoading);

    //view->load(QUrl::fromUserInput("http://www.youtube.com/watch?v=Zi_XLOBDo_Y"));
    view->setFixedSize(parent->size());
    view->setContextMenuPolicy(Qt::NoContextMenu);
    view->show();

    this->show();

}




void GraphicsWeb::setOption(QString type, QVariantMap data)
{

    if (type == "loadUrl") {

        QString url = data.value("url").toString();

        if (url.startsWith("l:"))
            view->load(QUrl::fromLocalFile(Utils::getCurrentPath() + url.mid(2)));
        else
            view->load(QUrl::fromUserInput(url));
    }

}





// SLOTS

void GraphicsWeb::unlock()
{
    qDebug() << "OK";
    app->stopFullScreen();
}


void GraphicsWeb::message(QString msg)
{
    QVariantMap data;
    data.insert("text", msg);

    app->websocket->send("msg", data);
}





void GraphicsWeb::addPProotToJS()
{
    view->page()->mainFrame()->addToJavaScriptWindowObject("PProot", this);
}



void GraphicsWeb::finishLoading(bool)
{
}
