public enum Card {
    GUARD("Guard", 1, 5, "Guess the other player's hand"),
    PRIEST("Priest", 2, 2, "Look at the other player's hand"),
    BARON("Baron", 3, 2, "Compare hands; lower hand is out"),
    HANDMAID("Handmaid", 4, 2, "No effect"),
    PRINCE("Prince", 5, 2, "One player discards their hand"),
    KING("King", 6, 1, "Trade Hands"),
    COUNTESS("Countess", 7, 1, "Discard if caught with King or Prince"),
    PRINCESS("Princess", 8, 1, "Lose if discarded");

    private String name;
    private int value;
    private int amount;
    private String effect;

    private Card(String name, int value, int amount, String effect) {
        this.name = name;
        this.value = value;
        this.amount = amount;
        this.effect = effect;
    }

    public String getName() {
        return this.name;
    }

    public int getValue() {
        return this.value;
    }

    public int getAmount() {
        return this.amount;
    }

    public String getEffect() {
        return this.effect;
    }

    public String toString() {
        return this.name + "[" + this.value + "] -> " + this.effect;
    }
}
