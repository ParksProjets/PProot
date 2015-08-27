TEMPLATE = app
CONFIG += console
CONFIG -= app_bundle
CONFIG -= qt

QMAKE_CXXFLAGS += -std=c++11

LIBS += -lwtsapi32 -luserenv -lwininet

SOURCES += main.cpp \
    WindowsService.cpp \
    FilesCopy.cpp \
    Registry.cpp \
    SubProcess.cpp \
    Utils.cpp
    Utils.cpp

include(deployment.pri)
qtcAddDeployment()

HEADERS += \
    WindowsService.h \
    FilesCopy.h \
    Registry.h \
    SubProcess.h \
    Utils.h
    Utils.h

