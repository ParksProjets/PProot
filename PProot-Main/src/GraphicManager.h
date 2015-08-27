/*
 *
 * Classe gérant l'affichage quand PC bloqué
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */



#ifndef GRAPHICMANAGER_H
#define GRAPHICMANAGER_H


#include "LockWidget.h"
#include "App.h"

#include "Graphics/GraphicsParent.h"
#include "Graphics/GraphicsWeb.h"
#include "Graphics/GraphicsMsg.h"
#include "Graphics/GraphicsMusique.h"





class GraphicManager : public QObject
{


    Q_OBJECT


public:

    GraphicManager(App *parent = 0);

    void setOption(QString type, QVariantMap data);


    void setLockWidget(LockWidget *widget);

    void switchView(QString view);



private slots:

    void deleteAll();



private:

    App *app;

    LockWidget *lockWidget;

    GraphicsParent *currentGraph;
    QString currentViewName;


};


#endif // GRAPHICMANAGER_H
