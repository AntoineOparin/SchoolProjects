import java.util.Scanner;

public class LoveLetterApp {

    public static final String reset = "\u001B[0m";
    public static final String bold = "\u001B[1m";
    public static final String underline = "\u001B[4m";

    public static void main(String[] args) {
        GameManager manager = new GameManager();
        Scanner reader = new Scanner(System.in);
        Player player1 = manager.player1;
        Player player2 = manager.player2;
        Player[] players = {player1, player2};
        DCA allCards = manager.allCards;
        int round = 0;

        System.out.println("\nWelcome Losers.");
        System.out.println("This is a beautiful game called Love Letter, good luck.\nDecide who will be Player 1 and Player 2");
        System.out.println("Here are the cards with all their effects : \n\n" + allCards);

        while (checkWin(players)) {
            DCA deck = manager.deck;
            DCA discardPile = manager.discardPile;
            boolean gameRunning = true;
            int i = 0;

            System.out.println(players[i].getName() + " will start after pressing Enter");
            String start = reader.nextLine();

            if (start.length() >= 0) {
                System.out.print("\033[H\033[2J");
                System.out.flush();
            }

            if (round > 0) {
                deck = manager.resetDeck();
                manager.discardPile.clear();
                for (int j = 0; j < players.length; j++ ) {
                    players[j].giveNewHand();
                    manager.drawTopCard(players[j].getHand());
                }
            }

            while (gameRunning) {
                System.out.println("Ready " + players[i].getName() + " , press Enter to continue : ");
                String again = reader.nextLine();

                if (again.length() >= 0) {
                    System.out.print("\033[H\033[2J");
                    System.out.flush();
                }

                manager.drawTopCard(players[i].getHand());
                if ((players[i].getHand().getStackAtIndex(0) == Card.COUNTESS  || players[i].getHand().getStackAtIndex(1) == Card.COUNTESS) && manager.checkCountess(players[i].getHand())) {
                    System.out.println("You have picked up a Countess while having a Prince or a King, you countess has been discarded");
                    System.out.println("Press Enter to end your turn : ");
                    String countessAnswer = reader.nextLine();

                    if (countessAnswer.length() >= 0) {
                        System.out.print("\033[H\033[2J");
                        System.out.flush();
                    }
                    gameRunning = false;
                }

                System.out.println("------------------------------------------------");
                System.out.println("Make sure to type the Position, starting with 0");
                System.out.println("It's the turn of : " + bold + underline + players[i].getName() + reset + bold + " -> " + underline + players[i].getLoveLetter() + " love letter[s]" + reset);
                System.out.println(deck.getPointer() + " card[s] in the deck");
                System.out.println("Here is the " + bold + underline + "discard pile : " + reset + " \n" + discardPile);

                Card cardPlayed = null;
                int index = -1;
                while (cardPlayed == null || index == -1) {
                    try {
                        System.out.println("Here are " + bold + underline + " your cards" + reset + ", which one will you play?\n" + players[i].getHand());
                        try {
                            index = Integer.parseInt(reader.nextLine());   
                        } catch (NumberFormatException e) {
                            System.out.println(bold + "Hey Loser, that's not a number, try again.\n" + reset);
                            continue;
                        }
                        cardPlayed = players[i].getHand().getStackAtIndex(index);
                    } catch (IndexOutOfBoundsException e) {
                        System.out.println(bold + e.getMessage() + reset);
                    } 
                }

                switch (cardPlayed) {
                    case GUARD:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        Card cardGuessed = null;
                        int indexGuard = -1;
                        while (cardGuessed == null || indexGuard == -1) {
                            try {
                                System.out.println("Guess what card the other player is holding:");
                                System.out.println(allCards);
                                try {
                                    indexGuard = Integer.parseInt(reader.nextLine());
                                }
                                catch (NumberFormatException e) {
                                    System.out.println(bold + "Hey Loser, that's not a number, try again.\n" + reset);
                                    continue;
                            } 
                            cardGuessed = allCards.getStackAtIndex(indexGuard);
                            } catch (IndexOutOfBoundsException e) {
                                System.out.println(bold + e.getMessage() + reset);
                            }
                        }
                        int guessVictim = 0;
                        if (players[i] == player1)
                            guessVictim = 1;
                        if (manager.guessCard(players[guessVictim].getHand(), cardGuessed)) {
                            players[i].addLoveLetter();
                            System.out.println(players[i].getName() + " won because they guessed correctly, congrats");
                            gameRunning = false;
                        }
                        if (!(manager.guessCard(players[guessVictim].getHand(), cardGuessed)))
                            System.out.println("Wrong guess");

                        break;

                    case PRIEST:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        System.out.println("Here is the hand of the other player: ");
                        if (players[i] == player1)
                            System.out.println(player2.getHand());
                        else
                            System.out.println(player1.getHand());
                        break;

                    case BARON:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        if (manager.compareHands(player1.getHand(), player2.getHand()) == 1) {
                            player1.addLoveLetter();
                            System.out.println("Player1 wins because he has (" + player1.getHand().getStackAtIndex(0) + ") " + " and Player2 has " + player2.getHand().getStackAtIndex(0)+ ")");
                        }
                        else {
                            player2.addLoveLetter();
                            System.out.println("Player2 wins because he has (" + player2.getHand().getStackAtIndex(0) + ") " + " and Player1 has (" + player1.getHand().getStackAtIndex(0) + ")");
                        }
                            
                        gameRunning = false;
                        break;

                    case HANDMAID:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        System.out.println("You discarded the handmaid");
                        break;
                    case PRINCE:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        System.out.println("You will discard a card from the other player if there are more cards in the deck : ");
                        if (players[i] == player1) {
                            if (manager.hasPrincess(player2.getHand()))
                                gameRunning = false;
                            else
                                manager.princeDiscardCard(player2.getHand(), deck);
                        }
                        else {
                            if (manager.hasPrincess(player1.getHand()))
                                gameRunning = false;
                            else
                                manager.princeDiscardCard(player1.getHand(), deck);
                        }
                            
                        break;
                    case KING:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        manager.tradeHands(players[0].getHand(), players[1].getHand());
                        break;
                    case COUNTESS:
                        manager.discardCard(players[i].getHand(), cardPlayed);
                        System.out.println("You discarded the Countess");
                        break;
                    case PRINCESS:
                        if (players[i] == player1)
                            player2.addLoveLetter();
                        else
                            player1.addLoveLetter();
                        System.out.println(players[i].getName() + " lost because they discarded the princess");
                        gameRunning = false;
                        break;
                }

                System.out.println("Press Enter to end turn : ");
                String end = reader.nextLine();

                if (end.length() >= 0) {
                    System.out.print("\033[H\033[2J");
                    System.out.flush();
                }

                if (i == players.length - 1)
                    i = i - players.length + 1;
                else
                    i++;

                if (deck.getLength() < 0) {
                    if (manager.compareHands(player1.getHand(), player2.getHand()) == 1) {
                        player1.addLoveLetter();
                        System.out.println("Player1 wins because he has " + player1.getHand().getStackAtIndex(0) + " and Player2 has " + player2.getHand().getStackAtIndex(0));
                    }
                    else {
                        player2.addLoveLetter();
                        System.out.println("Player2 wins because he has " + player2.getHand().getStackAtIndex(0) + " and Player1 has " + player1.getHand().getStackAtIndex(0));
                    }
                        
                    gameRunning = false;
                }
            }
            round++;
        }
        reader.close();
    }

    public static String toString(Player[] array) {
        String output = "";
        for (int i = 0; i < array.length; i++) {
            output += "Position " + i + " : Player" + (i + 1) + "\n";
        }
        return output;
    }

    public static boolean checkWin(Player[] players) {
        for (Player player : players) {
            if(player.playerWin()) {
                System.out.println(player.getName() + " has won the entire game because they have collected 5 love letters.");
                return false;
            }
        }
        return true;
    }
}
