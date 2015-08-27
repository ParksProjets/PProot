#include "GraphicsMusique.h"
#include "Utils.h"



GraphicsMusique::GraphicsMusique(QWidget *parent, App *a) :
    GraphicsParent(parent, a),
    loaded(false),
    currentVolume(1)
{

    view = new QWebView(this);

    connect(view, &QWebView::loadFinished, this, &GraphicsMusique::finishLoading);


    view->load(QUrl::fromLocalFile(Utils::getCurrentPath() + "Musique.html"));
    view->setFixedSize(parent->size());
    view->setContextMenuPolicy(Qt::NoContextMenu);
    view->show();

    this->show();

}




void GraphicsMusique::setOption(QString type, QVariantMap data)
{

    if (type == "play") {
        play(data.value("src").toString());

        if (data.contains("volume"))
            setVolume(data.value("volume", 100).toInt());
    }


    else if (type == "pause")
        pause();


    else if (type == "volume")
         setVolume(data.value("volume", 100).toInt());


    else if (type == "text")
        setText(data.value("text").toString());

}




void GraphicsMusique::play(QString src)
{
    srcToPlay = src;

    if (loaded)
        view->page()->mainFrame()->evaluateJavaScript("Player.play('" + src + "');");
}



void GraphicsMusique::pause()
{
    if (loaded)
        view->page()->mainFrame()->evaluateJavaScript("Player.pause();");
}



void GraphicsMusique::setVolume(int volume)
{
    currentVolume = (double)volume / 100;
    QString val = QString::number(currentVolume);

    if (loaded)
        view->page()->mainFrame()->evaluateJavaScript("Player.setVolume(" + val + ");");
}




void GraphicsMusique::setText(QString text)
{
    currentText = text;

    if (loaded)
        view->page()->mainFrame()->evaluateJavaScript("View.setText('" + text.replace("'", "\\'") + "');");
}





// SLOTS

void GraphicsMusique::finishLoading(bool)
{
    loaded = true;

    if (!srcToPlay.isEmpty())
        play(srcToPlay);

    setVolume((int)(currentVolume * 100));

    if (!currentText.isEmpty())
        setText(currentText);
}
