# gv
## Google Voice command line client

**gv** is a command line client for Google Voice. It intends to replicate most of the same functionality that can be done through google.com/voice, and provide an easily scriptable interface.

gv uses git-style subcommands and includes ``gv-send``, ``gv-ls``, and ``gv-contacts``.

##Usage

    Usage: gv [options] [command]
    
    Commands:
      
      ls                     List messages
      contacts               List your contacts
      send [message]         Send an sms to a contact
      help [cmd]             display help for [cmd]

      Options:

        -h, --help     output usage information
        -V, --version  output the version number

##gv-send

**gv-send** allows you to send an SMS message to one of your contacts. Since the Google Voice API doesn't provide a way to send an SMS by contact name, you'll have to get the phone number from some where. gv-send integrates well with command-line address books such as [ppl](http://ppladdressbook.org/) and can receive phone numbers from piping. For example:

    ppl phone matthew | gv send Hey there buddy!

Will send an SMS to your contact *matthew*, assuming you have one, with the message ``Hey there buddy!``.

Alternatively you can invoke ``ppl`` from within the ``gv-send`` command:

    gv send -p matthew Hey there bud.

##gv-ls

**gv-ls** lists messages in your Google Voice folders.
