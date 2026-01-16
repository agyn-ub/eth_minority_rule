import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-primary"></div>
          <h1 className="text-xl font-bold">How It Works</h1>
          <div className="w-2 h-2 bg-accent"></div>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Discover the game theory, technology, and strategy behind Minority Rule
        </p>
      </div>

      {/* Introduction */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-accent"></div>
        <CardHeader>
          <CardTitle className="text-lg font-bold">What is Minority Rule?</CardTitle>
          <CardDescription>A psychological strategy game on the blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            Minority Rule is a decentralized game where players compete by choosing between two options
            (YES or NO) in each round. The twist? <span className="text-primary font-bold">Only the minority survives.</span>
          </p>
          <p className="text-base leading-relaxed">
            Players who vote with the majority are eliminated. The game continues until only one player
            remains, or until a minimum threshold is reached. The survivors split the prize pool.
          </p>
          <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
            <p className="text-sm font-bold text-accent mb-2">Key Rule</p>
            <p className="text-sm text-muted-foreground">
              If everyone tries to be in the minority, who actually ends up there? That's the paradox
              that makes this game endlessly strategic.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚖️</div>
            <div>
              <CardTitle className="text-lg font-bold">The Philosophy: Reality is Minority Rule</CardTitle>
              <CardDescription>Power, wealth, and control belong to the few</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            In the real world, <span className="text-primary font-bold">1% of people control 99% of the wealth.</span>{' '}
            Everything—governments, corporations, markets, media—is ruled by the minority. The few decide
            for the many. This is the ultimate minority rule.
          </p>

          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
            <p className="text-sm font-bold text-primary mb-2">The Irony</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In our game, being in the minority means survival. In real life, being in the minority
              (the elite few) also means winning. But here's the twist: in this game,{' '}
              <span className="font-bold text-foreground">anyone can be the minority by choice</span>.
              You're not born into it. You earn it through strategy, psychology, and risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded-lg border border-border/30">
              <p className="text-sm font-bold mb-2">🏛 Real World</p>
              <p className="text-xs text-muted-foreground">
                Power concentrated in the hands of the few. The masses follow, the elite decide.
                Wealth inequality grows. The minority rules.
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg border border-border/30">
              <p className="text-sm font-bold mb-2">🎮 This Game</p>
              <p className="text-xs text-muted-foreground">
                Power belongs to those who think differently. Stand apart from the crowd to survive.
                Strategy beats conformity. Choose to be the minority.
              </p>
            </div>
          </div>

          <p className="text-base leading-relaxed">
            This game is a microcosm of reality with one crucial difference: here, the playing field
            is level. No inherited wealth, no insider advantages—just you, your wallet, and your ability
            to think against the crowd. Can you claim your place among the minority?
          </p>
        </CardContent>
      </Card>

      {/* Inspiration */}
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎬</div>
            <div>
              <CardTitle className="text-lg font-bold">Inspired by Liar Game</CardTitle>
              <CardDescription>The legendary Japanese psychological thriller</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            Liar Game is a Japanese manga and TV series that captivated audiences with its intense
            psychological battles and game theory puzzles. Contestants face elimination games where
            trust, deception, and strategic thinking determine survival.
          </p>
          <p className="text-base leading-relaxed">
            The "Minority Rule" game featured in the series inspired this blockchain adaptation,
            where players must navigate the same psychological warfare—but with real cryptocurrency
            stakes and cryptographic guarantees of fairness.
          </p>

          <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
            <p className="text-sm font-bold text-accent mb-2">From the Creator</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I'm a huge fan of psychological game shows and anime like <span className="font-bold text-foreground">Liar Game</span>,{' '}
              <span className="font-bold text-foreground">Squid Game</span>, and{' '}
              <span className="font-bold text-foreground">Alice in Borderland</span>. These shows explore
              the darkest corners of human psychology under pressure. If this game succeeds, I plan to bring
              more games from the Liar Game series to the blockchain—imagine playing Contraband Game,
              Russian Roulette, or Musical Chairs with real crypto stakes!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30">
              <div className="text-xl mb-2">🧠</div>
              <p className="text-sm font-bold mb-1">Psychology</p>
              <p className="text-xs text-muted-foreground">Predict opponent behavior</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30">
              <div className="text-xl mb-2">🎯</div>
              <p className="text-sm font-bold mb-1">Strategy</p>
              <p className="text-xs text-muted-foreground">Adapt each round</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30">
              <div className="text-xl mb-2">⚡</div>
              <p className="text-sm font-bold mb-1">High Stakes</p>
              <p className="text-xs text-muted-foreground">Real consequences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Theory */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <CardTitle className="text-lg font-bold">Game Theory: The Minority Game</CardTitle>
              <CardDescription>A study in anti-coordination and emergent complexity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            The Minority Game is a famous concept in game theory and econophysics. Unlike traditional
            games where players benefit from coordination, the minority game rewards{' '}
            <span className="text-primary font-bold">anti-coordination</span>—being different from the crowd.
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-black/20 rounded-lg border-l-4 border-primary/50">
              <p className="text-sm font-bold mb-2">The Paradox</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If everyone thinks rationally and tries to join the minority, they create a new majority.
                This recursive reasoning creates unpredictable, chaotic outcomes—exactly what makes the
                game exciting.
              </p>
            </div>

            <div className="p-4 bg-black/20 rounded-lg border-l-4 border-accent/50">
              <p className="text-sm font-bold mb-2">Real-World Applications</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The minority game models real scenarios like stock market trading, traffic routing, and
                resource allocation where competing for scarce resources leads to complex dynamics.
              </p>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm font-bold mb-2">No Pure Strategy</p>
            <p className="text-sm text-muted-foreground">
              There is no "correct" answer in the minority game. The optimal choice depends entirely
              on what others do, creating an endless cycle of meta-gaming and psychological warfare.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <CardTitle className="text-lg font-bold">How to Play</CardTitle>
              <CardDescription>Step-by-step gameplay guide</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <p className="text-base font-bold mb-1">Join the Game</p>
                <p className="text-sm text-muted-foreground">
                  Pay the entry fee to join during the first round. All entry fees go into the prize pool.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                2
              </div>
              <div>
                <p className="text-base font-bold mb-1">Commit Your Vote</p>
                <p className="text-sm text-muted-foreground mb-2">
                  During the commit phase, secretly choose YES or NO. Your vote is encrypted and hidden
                  using a cryptographic commitment (commit-reveal pattern).
                </p>
                <div className="p-3 bg-accent/10 rounded border border-accent/30">
                  <p className="text-xs font-bold text-accent mb-1">⚠️ IMPORTANT</p>
                  <p className="text-xs text-muted-foreground">
                    Save your salt! You'll need it to reveal your vote later. Without it, you're eliminated.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <p className="text-base font-bold mb-1">Reveal Your Vote</p>
                <p className="text-sm text-muted-foreground">
                  During the reveal phase, prove your vote by submitting your salt. The smart contract
                  verifies that your revealed vote matches your earlier commitment.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div>
                <p className="text-base font-bold mb-1">Survive or Eliminate</p>
                <p className="text-sm text-muted-foreground">
                  After all votes are revealed, the minority survives and advances to the next round.
                  The majority is eliminated and loses their entry fee.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                5
              </div>
              <div>
                <p className="text-base font-bold mb-1">Win the Prize</p>
                <p className="text-sm text-muted-foreground">
                  The game continues until only one player remains (or a minimum threshold). Survivors
                  split the entire prize pool equally.
                </p>
              </div>
            </div>
          </div>

          {/* DAO Voting */}
          <div className="mt-6 p-5 bg-success/10 border-l-4 border-success rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">🗳️</div>
              <div>
                <p className="text-base font-bold text-success mb-1">Democracy: DAO Voting to Quit</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Players aren't trapped in the game. If more than 50% of active players vote to quit the game,
                  it ends immediately and the remaining prize pool is distributed equally among all surviving
                  players. This is true democracy in action—the majority can choose mercy over competition.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <p className="text-xs text-muted-foreground">
                  Any player can propose a vote to end the game early
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <p className="text-xs text-muted-foreground">
                  If 50%+ agree, the game ends and everyone splits the pot
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <p className="text-xs text-muted-foreground">
                  A safety valve for when competition becomes too intense
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <CardTitle className="text-lg font-bold">Technology Stack</CardTitle>
              <CardDescription>Built on secure, transparent blockchain infrastructure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blockchain */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary"></div>
              <p className="text-base font-bold">Base Blockchain (L2)</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Built on Base, a secure Layer 2 solution that offers low transaction fees and fast
              confirmation times while maintaining Ethereum's security guarantees.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-xs font-semibold">
                Fast
              </span>
              <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-xs font-semibold">
                Low Fees
              </span>
              <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-xs font-semibold">
                Ethereum Security
              </span>
            </div>
          </div>

          {/* Non-Custodial */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-accent"></div>
              <p className="text-base font-bold">100% Non-Custodial</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Non-custodial means you maintain complete control of your wallet and funds at all times.
              We never hold, store, or have access to your cryptocurrency. There are no accounts to create,
              no deposits to a platform wallet, and no withdrawal delays.
            </p>

            <div className="space-y-3 mb-3">
              <div className="p-3 bg-accent/10 rounded border border-accent/30">
                <p className="text-xs font-bold text-accent mb-1">Your Keys, Your Crypto</p>
                <p className="text-xs text-muted-foreground">
                  Connect with your own MetaMask wallet. You sign transactions directly from your wallet.
                  Funds move directly from your wallet to the smart contract, and winnings are sent directly
                  back to your wallet.
                </p>
              </div>

              <div className="p-3 bg-black/20 rounded">
                <p className="text-xs font-bold mb-1">Smart Contract Escrow</p>
                <p className="text-xs text-muted-foreground">
                  Entry fees are held in the smart contract during the game—not in our possession. The
                  contract automatically distributes prizes to winners based on code, not human decisions.
                  No one can freeze, confiscate, or control your funds except the transparent contract rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✗ No Platform Risk</p>
                <p className="text-xs text-muted-foreground">Platform can't be hacked for user funds</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✗ No Exit Scams</p>
                <p className="text-xs text-muted-foreground">Operators can't run away with money</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✗ No Withdrawal Limits</p>
                <p className="text-xs text-muted-foreground">Win and receive funds immediately</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✗ No KYC Required</p>
                <p className="text-xs text-muted-foreground">Just connect your wallet and play</p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-success/10 rounded border border-success/30">
              <p className="text-xs font-bold text-success mb-1">Maximum Security & Freedom</p>
              <p className="text-xs text-muted-foreground">
                Unlike traditional online gaming platforms that hold your money, non-custodial design
                eliminates counterparty risk. You're only trusting auditable, immutable smart contract
                code—not a company or platform.
              </p>
            </div>
          </div>

          {/* Commit-Reveal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-success"></div>
              <p className="text-base font-bold">Commit-Reveal Pattern</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The commit-reveal pattern is a cryptographic technique that prevents cheating and ensures
              fairness in blockchain games.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-black/20 rounded">
                <p className="text-sm font-bold mb-1">Phase 1: Commit</p>
                <p className="text-xs text-muted-foreground">
                  You submit a cryptographic hash of your vote + random salt. This proves you made a
                  choice without revealing what it is.
                </p>
              </div>

              <div className="p-3 bg-black/20 rounded">
                <p className="text-sm font-bold mb-1">Phase 2: Reveal</p>
                <p className="text-xs text-muted-foreground">
                  After all commits are in, you reveal your actual vote + salt. The contract verifies
                  the hash matches, proving you didn't change your vote.
                </p>
              </div>

              <div className="p-3 bg-success/10 rounded border border-success/30">
                <p className="text-xs font-bold text-success mb-1">Why This Matters</p>
                <p className="text-xs text-muted-foreground">
                  Without commit-reveal, players could wait to see others' votes before choosing,
                  destroying the game's strategic depth. This pattern makes simultaneous secret voting
                  possible on a transparent blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Smart Contracts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary"></div>
              <p className="text-base font-bold">Smart Contract Security</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              All game logic is encoded in immutable smart contracts. Once deployed, the rules cannot
              be changed. Every transaction and vote is recorded on-chain and publicly verifiable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✓ Transparent</p>
                <p className="text-xs text-muted-foreground">All code is open source</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✓ Immutable</p>
                <p className="text-xs text-muted-foreground">Rules can't be changed</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✓ Trustless</p>
                <p className="text-xs text-muted-foreground">No need to trust anyone</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded border border-border/30">
                <p className="text-xs font-bold mb-1">✓ Verifiable</p>
                <p className="text-xs text-muted-foreground">Anyone can audit</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Tips */}
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <CardTitle className="text-lg font-bold">Strategy Tips</CardTitle>
              <CardDescription>Outsmart your opponents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-surface-elevated rounded-lg border-l-4 border-primary">
            <p className="text-sm font-bold mb-1">Think One Level Deeper</p>
            <p className="text-xs text-muted-foreground">
              Don't just think about what the minority will be—think about what everyone else thinks
              the minority will be, and choose accordingly.
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border-l-4 border-accent">
            <p className="text-sm font-bold mb-1">Track Voting Patterns</p>
            <p className="text-xs text-muted-foreground">
              Past rounds reveal player psychology. Look for patterns in how the crowd behaves under
              pressure.
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border-l-4 border-success">
            <p className="text-sm font-bold mb-1">Embrace Chaos in Large Games</p>
            <p className="text-xs text-muted-foreground">
              With many players, votes tend toward 50/50 splits. With few players, psychology and
              game theory dominate.
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border-l-4 border-primary">
            <p className="text-sm font-bold mb-1">There's No "Safe" Choice</p>
            <p className="text-xs text-muted-foreground">
              Both YES and NO are equally risky. The game is designed to have no dominant strategy—only
              adaptation and psychology matter.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card text-center">
        <CardContent className="py-8">
          <p className="text-lg font-bold mb-2">Ready to Test Your Strategy?</p>
          <p className="text-sm text-muted-foreground mb-6">
            Join a game and experience the psychological warfare firsthand
          </p>
          <Link href="/">
            <Button size="lg" variant="gradient" className="h-12 px-8">
              ⚡ Browse Games
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Contact & Community */}
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">💬</div>
            <div>
              <CardTitle className="text-lg font-bold">Join the Community</CardTitle>
              <CardDescription>Connect, discuss strategy, and stay updated</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground leading-relaxed">
            This project is built by a passionate fan of psychological games who wants to bring the
            thrill of Liar Game to the blockchain. Join the community to discuss strategy, share ideas,
            and help shape the future of on-chain psychological warfare.
          </p>

          <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-accent/10 to-primary/5 rounded-lg border border-accent/30">
            <div className="text-3xl">𝕏</div>
            <div className="text-left">
              <p className="text-sm font-bold mb-1">Follow on X (Twitter)</p>
              <a
                href="https://x.com/0xAngusBro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-bold hover:text-accent/80 transition-colors text-base"
              >
                @0xAngusBro
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30 text-center">
              <p className="text-sm font-bold mb-1">💡 Share Ideas</p>
              <p className="text-xs text-muted-foreground">
                Suggest new game mechanics
              </p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30 text-center">
              <p className="text-sm font-bold mb-1">📢 Get Updates</p>
              <p className="text-xs text-muted-foreground">
                New games and features
              </p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border/30 text-center">
              <p className="text-sm font-bold mb-1">🤝 Connect</p>
              <p className="text-xs text-muted-foreground">
                Meet other players
              </p>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
            <p className="text-sm font-bold mb-2">Future Games Coming</p>
            <p className="text-xs text-muted-foreground">
              If Minority Rule succeeds, more Liar Game classics are coming: Contraband Game, Russian
              Roulette, Musical Chairs, Smuggling Game, and more. Follow to stay informed!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
