# PProot-Deploit

Programme de déploiment. Il créer un service Windows (lui permettant d'être lancé à chaque démarrage du PC) et permet de télécharger / copier PProot-Main.

Pour déployer PProot sur un PC, il souffis de lancer se programme depuis n'importe où (clé USB, WPKG, ...) en administateur.




## Prérequis

Pas de library externe.
Le code a été crée avec QtCreator.




## Code a changer

Il faut au moins changer "SRC_PPROOT_DEPLOIT" qui l'emplacent de PProot-Main, dans "main.cpp", et SERVER_NAME dans "Utils.h"