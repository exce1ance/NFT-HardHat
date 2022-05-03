const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Contrato NFT", function () {

    let Coleccion;
    let hhColeccion;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let direcciones;
    const _direccionesWhitelist = [];
    const max_mint = 3;
    const uriNotRevealed = "http://notRevealed";
    const uriRevelado = "https://DirRevealed/"

    before(async function () {

        Coleccion = await ethers.getContractFactory("ColeccionNFT3");

        direcciones = await hre.ethers.getSigners();

        // Owner
        owner = direcciones[0]
        console.log("Owner:", owner.address)
        // Whitelist
        for (let i = 1; i <= 5; i++) {
            _direccionesWhitelist.push(direcciones[i].address)
        }
        console.log("Direcciones WhiteList:", _direccionesWhitelist)

        hhColeccion = await Coleccion.deploy();
    })

    describe("Variables iniciales", function () {

        it("Debe comenzar con las variables correctamente inicializadas", async function () {

            expect(await hhColeccion._baseURIextended()).to.equal("")
            expect(await hhColeccion._baseURInotRevealed()).to.equal("")
            expect(await hhColeccion.MAX_SUPPLY()).to.equal(20)
            expect(await hhColeccion.MAX_PUBLIC_MINT()).to.equal(2)
            expect(await hhColeccion.PRICE_PER_TOKEN()).to.equal(1000000000000000)
            expect(await hhColeccion.whitelistIsActive()).to.equal(false)
            expect(await hhColeccion.saleIsActive()).to.equal(false)
            expect(await hhColeccion.revealed()).to.equal(false)
            expect(await hhColeccion.tokenId()).to.equal(0)
            await expect(hhColeccion.mintWhitelist(1)).to.be.revertedWith("Whitelist is not active")
            await expect(hhColeccion.mint(1)).to.be.revertedWith("Sale is not active yet")
        })

    })

    describe("Whitelist", function () {
        it("Debe llenar la whitelist", async function () {

            // Trato de llenar la whitelist desde una direccion que no es la Owner
            await expect(hhColeccion.connect(direcciones[1]).setWhitelist(_direccionesWhitelist, max_mint)).to.be.revertedWith("Ownable: caller is not the owner")

            await hhColeccion.setWhitelist(_direccionesWhitelist, max_mint)

            for (const direccion of _direccionesWhitelist) {
                expect(await hhColeccion._whiteList(direccion)).to.greaterThan(0)
            }
        })

        it("Debe iniciar la whitelist", async function () {
            await hhColeccion.setWhitelistActive()
            expect(await hhColeccion.whitelistIsActive()).to.equal(true)
        })
    })

    describe("BaseURI not Revealed", function () {
        it("Debe darle valor a _baseURInotRevealed", async function () {

            console.log("WhiteList Activa:", await hhColeccion.whitelistIsActive())


            await hhColeccion.setBaseUriNotRevealed(uriNotRevealed)
            expect(await hhColeccion._baseURInotRevealed()).to.equal(uriNotRevealed)

        })

    })

    describe("Mint Whitelist", function () {
        it("Debe poder mintear la whitelist", async function () {

            // Está en la whitelist pero quiere mintear mas del maximo asignado (3)
            await expect(hhColeccion.connect(direcciones[1]).mintWhitelist(4, { value: 4000000000000000 })).to.be.revertedWith("Exceeded max available to purchase")
            // No está en la whitelist y quiere mintear 2
            await expect(hhColeccion.connect(direcciones[7]).mintWhitelist(2, { value: 2000000000000000 })).to.be.revertedWith("Exceeded max available to purchase")
            // Está en la whitelist pero envía menos ether del que corresponde
            await expect(hhColeccion.connect(direcciones[1]).mintWhitelist(3, { value: 2000000000000000 })).to.be.revertedWith("Ether value is not correct")

            // Las primeras 3 billeteras de la whitelist mintean 3 nfts c/u del total de 20
            for (let i = 1; i <= 3; i++) {
                await hhColeccion.connect(direcciones[i]).mintWhitelist(3, { value: 3000000000000000 })
                expect(await hhColeccion.balanceOf(direcciones[i].address)).to.equal(3)
                expect(await hhColeccion.tokenId()).to.equal((i * 3))
            }

            console.log("TokenId:", await hhColeccion.tokenId())
            // Intenta mintear de nuevo uno de la whitelist que ya mintió todo su cupo
            await expect(hhColeccion.connect(direcciones[1]).mintWhitelist(1, { value: 1000000000000000 })).to.be.revertedWith("Exceeded max available to purchase")

        })

    })

    describe("TokenURI", function () {
        it("El valor que devuelve tokenURI tiene que ser el de notRevealed", async function () {

            // 0 a 8 son los tokenId creados hasta el momento
            for (let i = 0; i <= 8; i++) {
                expect(await hhColeccion.tokenURI(i)).to.equal(uriNotRevealed)
            }

        })
    })

    describe("Public Sale", function () {
        it("Se abre la venta al publico", async function () {
            await hhColeccion.setSaleIsActive()
            expect(await hhColeccion.saleIsActive()).to.equal(true)

        })

        it("Debe poder mintear cualquiera", async function () {

            // Quiere mintear mas del maximo permitido (2)
            await expect(hhColeccion.connect(direcciones[7]).mint(4, { value: 4000000000000000 })).to.be.revertedWith("Exceeded max available to purchase")

            // Mintea 1 correctamente
            await hhColeccion.connect(direcciones[7]).mint(1, { value: 1000000000000000 })
            expect(await hhColeccion.balanceOf(direcciones[7].address)).to.equal(1)

            // TokenId
            tokenId = await hhColeccion.tokenId()
            console.log("TokenId:", tokenId)

            // Varias billeteras compran de a 2, sin problemas..
            for (let i = 0; i <= 3; i++) {
                await hhColeccion.connect(direcciones[8 + i]).mint(2, { value: 2000000000000000 })
                expect(await hhColeccion.balanceOf(direcciones[8 + i].address)).to.equal(2)
            }

            // Se compran los últimos 2 de los 20
            await hhColeccion.connect(direcciones[12]).mint(2, { value: 2000000000000000 })
            expect(await hhColeccion.balanceOf(direcciones[12].address)).to.equal(2)

            // Ya estan minteados los 20 token, del 0 al 19 tokenId
            tokenId = await hhColeccion.tokenId()
            console.log("TokenId:", tokenId)

            // Otra billetera quiere mintear 1 mas pero ya se mintearon todos
            await expect(hhColeccion.connect(direcciones[13]).mint(1, { value: 1000000000000000 })).to.be.revertedWith("Purchase will exceed max supply")

        })

    })

    describe("NFT Reveal", function () {
        it("Se revelan los tokens y se setea el nuevo URI", async function () {

            // Se pasa a true revealed
            await hhColeccion.revealCollection()
            expect(await hhColeccion.revealed()).to.equal(true)

            await hhColeccion.setBaseUriExtended(uriRevelado)

            for (let i = 0; i <= 19; i++) {
                expect(await hhColeccion.tokenURI(i)).to.equal(uriRevelado + i.toString())
            }

        })

    })

    describe("Retiro de fondos", function () {
        it("Se retira lo acumulado en el contrato", async function () {

            const ownerBalanceActual = await waffle.provider.getBalance(owner.address)
            const contractBalance = await waffle.provider.getBalance(hhColeccion.address)

            console.log("Balance Owner:", ownerBalanceActual)
            console.log("Balance Contrato:", contractBalance)

            tx = await hhColeccion.withdraw()
            const receipt = await tx.wait();
            const gasUsed = BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice);
            console.log("Gas Usado:", gasUsed)
            expect(await waffle.provider.getBalance(owner.address)).to.equal(ownerBalanceActual.toBigInt() - gasUsed + contractBalance.toBigInt())

        })

    });

});

