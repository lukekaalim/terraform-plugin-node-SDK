---
layout: default
title: Plugin
parent: Concepts
nav_order: 1
---
# Plugin

A Terraform Plugin is an executable file, which implements the hashicorp go-plugin system, hosting a GRPC Terraform Service.

## Go Plugin
Hashicorp's go-plugin is a golang specific library, but also a specification for cross-process communication with a server-client model. More specifically, it's a way for one executable to call specific functions in another executable, extending it's own functionality (the one exposing the functions is the "plugin" or the "server", and the), using a shared and agreed upon format.

A Go Plugin is composed of two main parts:

1. The STDOUT handshake
2. The GRPC server
