/*
 *
 *
 *
 */


#include "GraphicsMsg.h"


GraphicsMsg::GraphicsMsg(QWidget *parent, App *a) : GraphicsParent(parent, a)
{

    label = new QLabel("Bonjour !", this);
    label->setAlignment(Qt::AlignCenter);
    label->setFixedSize(parent->size());
    label->show();

    this->show();

}





void GraphicsMsg::setOption(QString type, QVariantMap data)
{

    if (type == "setMsg")
        label->setText(data.value("text", "Bonjour !").toString());

}
