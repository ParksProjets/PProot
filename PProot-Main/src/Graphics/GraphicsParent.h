#ifndef GRAPHICSPARENT_H
#define GRAPHICSPARENT_H


#include <QObject>
#include <QWidget>
#include <QVariant>
#include <QMap>

class App;


class GraphicsParent : public QWidget
{

    Q_OBJECT


public:

    GraphicsParent(QWidget *parent = 0, App *a = 0);

    virtual void setOption(QString type, QVariantMap data);


protected:

    App *app;

};



#endif // GRAPHICSPARENT_H
