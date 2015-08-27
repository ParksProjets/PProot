/*
 *
 * Classe gérant l'affichage quand PC bloqué
 *
 *
 * © 2015 - Guillaume Gonnet
 * License GPLv2
 */


#include "GraphicManager.h"
#include <QDebug>



GraphicManager::GraphicManager(App *parent) :
    QObject(parent)
{

    app = parent;


    lockWidget = NULL;

    currentGraph = NULL;
    currentViewName = "";

}




void GraphicManager::setOption(QString type, QVariantMap data)
{

    if (type == "setView")
        switchView(data.value("view").toString());

    else if (type == "viewOption" && currentGraph)
        currentGraph->setOption(data.take("viewOption").toString(), data);

}








void GraphicManager::setLockWidget(LockWidget *widget)
{

    lockWidget = widget;
    connect(lockWidget, SIGNAL(destroyed()), this, SLOT(deleteAll()));

    if (!currentViewName.isEmpty())
        switchView(currentViewName);

}




void GraphicManager::switchView(QString view)
{

    if (!lockWidget)
        return;

    if (currentGraph)
        delete currentGraph;


    currentViewName = view;

    if (view == "web")
        currentGraph = new GraphicsWeb(lockWidget, app);

    else if (view == "musique")
        currentGraph = new GraphicsMusique(lockWidget, app);

    else if (view == "msg")
        currentGraph = new GraphicsMsg(lockWidget, app);

    else {
        currentGraph = NULL;
        currentViewName = "";
    }

}





void GraphicManager::deleteAll()
{
    lockWidget = NULL;

    if (currentGraph)
        delete currentGraph;

    currentGraph = NULL;

}


