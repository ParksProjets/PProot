/*
 *
 * Affichage: Simple message (à utiliser si Musique marche pas)
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#ifndef GRAPHICSMSG_H
#define GRAPHICSMSG_H


#include "GraphicsParent.h"

#include <QLabel>

class GraphicsParent;
class App;


class GraphicsMsg : public GraphicsParent
{


public:

    GraphicsMsg(QWidget *parent = 0, App *a = 0);

    virtual void setOption(QString type, QVariantMap data);



private:

    QLabel *label;

};



#endif // GRAPHICSMSG_H
