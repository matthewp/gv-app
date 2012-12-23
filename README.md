# gv
## Google Voice command line client

**gv** is a command line client for Google Voice. It intends to replicate most of the same functionality that can be done through google.com/voice, and provide an easily scriptable interface.

gv uses git-style subcommands and includes ``gv-send``, ``gv-ls``, and ``gv-contacts``.

##gv-send

**gv-send** Allows you to send an SMS message to one of your contacts. Since the Google Voice API doesn't provide a way to send an SMS by contact name, you'll have to get the phone number from some where. gv-send integrates well with command-line address books such as [ppl](http://ppladdressbook.org/) and can receive phone numbers from piping. For example:

    ppl phone matthew | gv send Hey there buddy!

Will send an SMS to your contact *matthew*, assuming you have one, with the message ``Hey there buddy!``.
