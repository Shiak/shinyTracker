// Take input of:
// - pokemon hunted
// - what game
// - method of hunting
// - shiny charm if applicable

// What to output:
// - Sprites, both shiny and regular
// - Current increment
// - Shiny Statistics
//   - odds of shiny (at current chain)
//   - cumulative odds of shiny B(n,p)
//   - Count till 90% odds of getting shiny
// - Timing Information
//   - time since started hunting
//   - time since last increment

function binomialCDF(probability: number, trials: number): number {
    // F(k;n,p) = Pr(X<=k) = E(|k|, i=0) Choose(n,i) p^i (1-p)^(n-i)
    // Pr(X<=k) = 1 - Pr(X>k) -> Pr(X>0) = 1 - Pr(X<=0)
    // c(n, 0) = 1

    let res = 1 - ((probability ** 0) * (1 - probability) ** trials) 
    return res;
}

//rewrite using an interace and remove the SUPER from the other classes
class ShinyMethodBase {
    name: string;
    validGenerations: number[];
    odds: number;
    probability: string;
    
    constructor(methodName: string, generation: number[], odds: number, probability: string) {
        this.name = methodName
        this.validGenerations = generation
        this.odds = odds 
        this.probability = probability
    }
}


class Masuda {
    name: string = "Masuda Method";
    description: string = "International marriage method. ";
    validGeneration: number[] = [4,5,6,7,8];
    odds: number;
    oddsStr: string;

    constructor(generation: number, hasCharm: boolean) {
        let odds: number
        let oddsStr: string
        if (generation === 4) {
            odds = 1/1683
            oddsStr = '1/1683' 
        } else if (generation === 5) {
            odds = (hasCharm ? 1/1024 : 1/1365);
            oddsStr = (hasCharm ? '1/1024' : '1/1365');
        } else if (generation === 6 || generation === 7) {
            odds = (hasCharm ? 1/527 : 1/683);
            oddsStr = (hasCharm ? '1/527' : '1/683');
        } else if (generation === 8) {
            odds = (hasCharm ? 1/512 : 1/682.7);
            oddsStr = (hasCharm ? '1/512' : '1/682.7');
        } else {
            odds = 0
            oddsStr = 'Not Found'
        }
        this.odds = odds
        this.oddsStr = oddsStr
    }

    getCurrentOdds(): number {
        // no updated current odds since Masuda Method does not change probability
        // returns human readable probability 
        return this.odds
    }

    getCurrentOddsStr(): string {
        // no updated current odds since Masuda Method does not change probability
        // returns human readable probability 
        return this.oddsStr
    }

    getProbability(count: number): number {
        // shows the probability of getting at least Count number
        // cumulative probability of binomial
        let res = binomialCDF(this.odds, count)
        return res
    }

    logStats(count: number) {
        // Helper function for testing purposes
        console.log('-----------------------')
        console.log('Current Count: ' + count)
        console.log('Current Odds: ' + this.getCurrentOddsStr())
        console.log('Current Probability: ' + (this.getProbability(count)*100).toFixed(2) + '%')
    }
}


class SOSChaining {
    name: string = "SOS Chanining";
    description: string = "SOS Call chaining from Sun and Moon. ";
    validGeneration: number[] = [7];
    odds: number;
    oddsStr: string;
    hasCharm: boolean;

    constructor(hasCharm: boolean, chain: number = 0) {
        let odds: number
        let oddsStr: string
        if (chain % 256 <= 69) {
            odds = (hasCharm ? 1/1365 : 1/4096);
            oddsStr = (hasCharm ? '1/1365' : '1/4096');
        } else if (chain % 256 > 69) {
            odds = (hasCharm ? 1/683 : 1/1024);
            oddsStr = (hasCharm ? '1/683' : '1/1024');
        } else {
            odds = 0
            oddsStr = 'None'
        }
        this.odds = odds;
        this.oddsStr = oddsStr;
        this.hasCharm = hasCharm;
    }

    updateOdds(chain: number) {
        let odds: number
        let oddsStr: string
        if (chain % 256 <= 69) {
            odds = (this.hasCharm ? 1/1365 : 1/4096);
            oddsStr = (this.hasCharm ? '1/1365' : '1/4096');
        } else if (chain % 256 > 69) {
            odds = (this.hasCharm ? 1/683 : 1/1024);
            oddsStr = (this.hasCharm ? '1/683' : '1/1024');
        } else {
            odds = 0
            oddsStr = 'None'
        }
        this.odds = odds;
        this.oddsStr = oddsStr; 
        return
    }

    getCurrentOdds(chain: number): string {
        // no updated current odds since Masuda Method does not change probability
        // returns human readable probability
        this.updateOdds(chain)
        return this.oddsStr
    }

    getProbability(count: number): number {
        // shows the probability of getting at least Count number
        // cumulative probability of binomial
        let res: number = 0;
        let rollover = Math.floor(count / 256);
        this.updateOdds(1)
        let lowOdds = this.odds
        this.updateOdds(70)
        let highOdds = this.odds
        this.updateOdds(count)
        res = rollover * (binomialCDF(lowOdds, 69) + binomialCDF(highOdds, 256 - 69))
            
        if (count % 256 <= 69) {
            res += binomialCDF(this.odds, (count % 256))  
        } else if ((count % 256) > 69 && (count % 256) < 256) {
            res += binomialCDF(lowOdds, 69)
            res += binomialCDF(this.odds, (count % 256) - 69)
        }
        return res
    }

    logStats(count: number) {
        // Helper function for testing purposes
        console.log('-----------------------')
        console.log('Current Count: ' + count)
        console.log('Current Odds: ' + this.getCurrentOdds(count))
        console.log('Current Probability: ' + (this.getProbability(count)*100).toFixed(2) + '%')
    }
}


let date = new Date()

let startTime = date.toLocaleTimeString()
let startDate = date.toLocaleDateString()
console.log('Starting timestamp: ' + startDate + ' ' + startTime)

let masuda = new Masuda(8, true)
console.log("-----------------------")
console.log("---- MASUDA METHOD ----")
masuda.logStats(100)
masuda.logStats(1000)
masuda.logStats(10000)

let sos = new SOSChaining(false)

console.log("-----------------------")
console.log("----- SOS CALLING -----")
sos.logStats(1)
sos.logStats(10)
sos.logStats(69)
sos.logStats(70)
sos.logStats(255)
sos.logStats(256)