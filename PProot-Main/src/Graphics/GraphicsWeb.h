#ifndef GRAPHICSWEB_H
#define GRAPHICSWEB_H


#include "GraphicsParent.h"
#include "App.h"
#include <QWebView>

class GraphicsParent;
class App;


class GraphicsWeb : public GraphicsParent
{

    Q_OBJECT


public:

    GraphicsWeb(QWidget *parent = 0, App *a = 0);

    virtual void setOption(QString type, QVariantMap data);


public slots:

    void unlock();

    void message(QString msg);


private slots:

    void addPProotToJS();

    void finishLoading(bool);


private:

    QWebView *view;


};


#endif // GRAPHICSWEB_H
