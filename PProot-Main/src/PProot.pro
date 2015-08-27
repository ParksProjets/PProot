#
#  PProot
#
#  © 2015 - Guillaume Gonnet
#


QT       += core gui network multimedia websockets webkitwidgets

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets


TARGET = PProot
TEMPLATE = app


#win32: LIBS += "advapi32.lib"
LIBS += -lole32
LIBS += -lwinmm
LIBS += -lwtsapi32


HEADERS += \
    LockWidget.h \
    SystemKeyTrapper.h \
    Inject.h \
    rfb/keysym.h \
    LocalSystem.h \
    Socket.h \
    App.h \
    Utils.h \
    FileDownloader.h \
    GraphicManager.h \
    Graphics/GraphicsParent.h \
    WebSocket.h \
    Graphics/GraphicsWeb.h \
    Graphics/GraphicsMsg.h \
    Graphics/GraphicsMusique.h


SOURCES += \
    LockWidget.cpp \
    SystemKeyTrapper.cpp \
    LocalSystem.cpp \
    Inject.cpp \
    main.cpp \
    Socket.cpp \
    App.cpp \
    FileDownloader.cpp \
    GraphicManager.cpp \
    Graphics/GraphicsParent.cpp \
    Utils.cpp \
    WebSocket.cpp \
    Graphics/GraphicsWeb.cpp \
    Graphics/GraphicsMsg.cpp \
    Graphics/GraphicsMusique.cpp


