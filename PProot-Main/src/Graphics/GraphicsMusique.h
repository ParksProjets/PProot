#ifndef GRAPHICSMUSIQUE_H
#define GRAPHICSMUSIQUE_H


#include "GraphicsParent.h"

#include <QWebView>
#include <QWebFrame>

class GraphicsParent;
class App;


class GraphicsMusique : public GraphicsParent
{

    Q_OBJECT


public:

    GraphicsMusique(QWidget *parent = 0, App *a = 0);

    virtual void setOption(QString type, QVariantMap data);


    void play(QString src = "");

    void pause();

    void setVolume(int volume);

    void setText(QString text);



private slots:

    void finishLoading(bool);



private:

    QWebView *view;

    bool loaded;


    QString srcToPlay;

    double currentVolume;

    QString currentText;

};




#endif // GRAPHICSMUSIQUE_H
