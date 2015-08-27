#include "GraphicsParent.h"


GraphicsParent::GraphicsParent(QWidget *parent, App *a) : QWidget(parent)
{
    app = a;
}


void GraphicsParent::setOption(QString type, QVariantMap data)
{
}
