// Paper Boats — Procedural Sprite Generation
const Sprites = {
    cache: {},

    // Generate a pixel art character sprite
    createCharacter(name, colors, isGhost = false) {
        const frames = {};
        const dirs = ['down', 'up', 'left', 'right'];
        const walkFrames = 4;

        dirs.forEach(dir => {
            frames[`idle_${dir}`] = [this.drawCharFrame(colors, dir, 0, isGhost)];
            const wf = [];
            for (let i = 0; i < walkFrames; i++) {
                wf.push(this.drawCharFrame(colors, dir, i, isGhost));
            }
            frames[`walk_${dir}`] = wf;
        });

        this.cache[name] = frames;
    },

    drawCharFrame(colors, dir, frame, isGhost) {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 24;
        const ctx = c.getContext('2d');

        // Body offset for walk animation
        const bobY = (frame % 2 === 1) ? -1 : 0;

        // Head
        ctx.fillStyle = colors.skin;
        ctx.fillRect(5, 1 + bobY, 6, 6);

        // Hair
        ctx.fillStyle = colors.hair;
        if (dir === 'down') {
            ctx.fillRect(5, 1 + bobY, 6, 2);
        } else if (dir === 'up') {
            ctx.fillRect(5, 1 + bobY, 6, 3);
        } else {
            ctx.fillRect(5, 1 + bobY, 6, 2);
            if (dir === 'left') ctx.fillRect(4, 2 + bobY, 2, 4);
            else ctx.fillRect(10, 2 + bobY, 2, 4);
        }

        // Eyes (front-facing)
        if (dir === 'down') {
            ctx.fillStyle = colors.eyes || '#1a1a2e';
            ctx.fillRect(6, 4 + bobY, 1, 1);
            ctx.fillRect(9, 4 + bobY, 1, 1);
        } else if (dir !== 'up') {
            ctx.fillStyle = colors.eyes || '#1a1a2e';
            if (dir === 'left') ctx.fillRect(5, 4 + bobY, 1, 1);
            else ctx.fillRect(10, 4 + bobY, 1, 1);
        }

        // Body/shirt
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(5, 7 + bobY, 6, 7);

        // Arms
        const armSwing = frame % 2 === 0 ? 0 : 1;
        if (dir === 'left' || dir === 'right') {
            ctx.fillStyle = colors.skin;
            ctx.fillRect(dir === 'left' ? 4 : 11, 8 + bobY + armSwing, 1, 4);
        } else {
            ctx.fillStyle = colors.skin;
            ctx.fillRect(4, 8 + bobY + (frame === 1 ? 1 : 0), 1, 4);
            ctx.fillRect(11, 8 + bobY + (frame === 3 ? 1 : 0), 1, 4);
        }

        // Pants/skirt
        ctx.fillStyle = colors.pants;
        ctx.fillRect(5, 14 + bobY, 6, 4);

        // Legs
        ctx.fillStyle = colors.skin;
        const legOffset = frame % 2 === 0 ? 0 : (frame === 1 ? 1 : -1);
        ctx.fillRect(6, 18 + bobY, 2, 4);
        ctx.fillRect(9, 18 + bobY, 2, 4);

        // Shoes/feet
        ctx.fillStyle = colors.shoes || colors.pants;
        ctx.fillRect(6, 21 + bobY, 2, 2);
        ctx.fillRect(9, 21 + bobY, 2, 2);

        // Flower pattern on shirt (for Thu)
        if (colors.flowerPattern) {
            ctx.fillStyle = colors.flowerPattern;
            ctx.fillRect(7, 9 + bobY, 1, 1);
            ctx.fillRect(9, 11 + bobY, 1, 1);
        }

        // Ghost effect
        if (isGhost) {
            const imgData = ctx.getImageData(0, 0, 16, 24);
            for (let i = 3; i < imgData.data.length; i += 4) {
                if (imgData.data[i] > 0) imgData.data[i] = 224; // alpha 0.88
            }
            ctx.putImageData(imgData, 0, 0);
        }

        return c;
    },

    // Portrait generation (larger pixel art faces)
    createPortrait(name, colors, expression = 'normal') {
        const c = document.createElement('canvas');
        c.width = 48;
        c.height = 48;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = colors.bg || '#2a2a3a';
        ctx.fillRect(0, 0, 48, 48);

        // Face shape
        ctx.fillStyle = colors.skin;
        ctx.fillRect(12, 8, 24, 28);
        ctx.fillRect(10, 12, 28, 20);

        // Hair
        ctx.fillStyle = colors.hair;
        ctx.fillRect(10, 4, 28, 10);
        ctx.fillRect(8, 8, 4, 16);
        ctx.fillRect(36, 8, 4, 16);
        if (colors.hasBraid) {
            // Braid for Thu
            ctx.fillRect(36, 16, 3, 14);
            ctx.fillRect(37, 30, 2, 4);
        }

        // Eyes
        ctx.fillStyle = '#1a1a2e';
        if (expression === 'crying') {
            ctx.fillRect(17, 20, 3, 2);
            ctx.fillRect(28, 20, 3, 2);
            // Tears
            ctx.fillStyle = '#6ba4c9';
            ctx.fillRect(18, 23, 1, 4);
            ctx.fillRect(29, 23, 1, 4);
        } else if (expression === 'sad') {
            ctx.fillRect(17, 21, 3, 2);
            ctx.fillRect(28, 21, 3, 2);
        } else {
            ctx.fillRect(17, 20, 3, 3);
            ctx.fillRect(28, 20, 3, 3);
            // Eye highlight
            ctx.fillStyle = '#fff';
            ctx.fillRect(18, 20, 1, 1);
            ctx.fillRect(29, 20, 1, 1);
        }

        // Mouth
        if (expression === 'real_smile') {
            ctx.fillStyle = '#c4626a';
            ctx.fillRect(19, 28, 10, 2);
            ctx.fillRect(20, 30, 8, 1);
            // Genuine warm smile
            ctx.fillStyle = '#fff';
            ctx.fillRect(21, 28, 6, 1);
        } else if (expression === 'sad' || expression === 'crying') {
            ctx.fillStyle = '#9a6060';
            ctx.fillRect(20, 29, 8, 1);
        } else {
            ctx.fillStyle = '#c4626a';
            ctx.fillRect(20, 28, 8, 2);
        }

        // Shirt collar
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(12, 36, 24, 12);

        // Flower on shirt for Thu
        if (colors.flowerPattern) {
            ctx.fillStyle = colors.flowerPattern;
            ctx.fillRect(18, 39, 2, 2);
            ctx.fillRect(28, 40, 2, 2);
        }

        // Ghost effect for Thu
        if (colors.isGhost) {
            const imgData = ctx.getImageData(0, 0, 48, 48);
            for (let i = 3; i < imgData.data.length; i += 4) {
                if (imgData.data[i] > 0) {
                    imgData.data[i] = Math.floor(imgData.data[i] * 0.92);
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        // Border
        ctx.strokeStyle = '#d4c9a8';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 47, 47);

        this.cache[`portrait_${name}`] = c;
    },

    // Initialize all sprites
    initAll() {
        // Minh
        this.createCharacter('minh', {
            skin: '#e8c8a0',
            hair: '#2a2020',
            shirt: '#a0c8e8',
            pants: '#4a4a6a',
            shoes: '#604020',
            eyes: '#1a1a2e',
        });

        // Thu (ghost)
        this.createCharacter('thu', {
            skin: '#e8d0b0',
            hair: '#1a1a20',
            shirt: '#88b8d0',
            pants: '#506878',
            shoes: '#604030',
            eyes: '#1a1a2e',
            flowerPattern: '#d0a0b0',
        }, true);

        // Bà Nội
        this.createCharacter('ba_noi', {
            skin: '#d8b890',
            hair: '#888888',
            shirt: '#8a7060',
            pants: '#6a5040',
            shoes: '#403020',
            eyes: '#1a1a2e',
        });

        // Ông Tư
        this.createCharacter('ong_tu', {
            skin: '#c8a880',
            hair: '#777777',
            shirt: '#7a6050',
            pants: '#5a4535',
            shoes: '#403020',
            eyes: '#1a1a2e',
        });

        // Bắp (the living boy who can't see Thu)
        this.createCharacter('bap', {
            skin: '#e0bd92',
            hair: '#23201c',
            shirt: '#cf6a48',
            pants: '#3c4a38',
            shoes: '#4a3a26',
            eyes: '#1a1a2e',
        });

        // Ông lái đò (ghost — spirit case)
        this.createCharacter('lai_do', {
            skin: '#aebccb',
            hair: '#6a7480',
            shirt: '#54707f',
            pants: '#3e5560',
            shoes: '#2e3a42',
            eyes: '#16202a',
        }, true);

        // Portraits
        this.createPortrait('lai_do', {
            skin: '#aebccb', hair: '#6a7480', shirt: '#54707f',
            bg: '#1c2a36', isGhost: true
        });
        this.createPortrait('minh', {
            skin: '#e8c8a0', hair: '#2a2020', shirt: '#a0c8e8',
            bg: '#2a3040'
        });
        this.createPortrait('thu_normal', {
            skin: '#e8d0b0', hair: '#1a1a20', shirt: '#88b8d0',
            bg: '#2a3848', flowerPattern: '#d0a0b0', hasBraid: true, isGhost: true
        });
        this.createPortrait('thu_sad', {
            skin: '#e8d0b0', hair: '#1a1a20', shirt: '#88b8d0',
            bg: '#2a3040', flowerPattern: '#d0a0b0', hasBraid: true, isGhost: true
        }, 'sad');
        this.createPortrait('thu_real_smile', {
            skin: '#e8d0b0', hair: '#1a1a20', shirt: '#88b8d0',
            bg: '#3a3020', flowerPattern: '#d0a0b0', hasBraid: true, isGhost: true
        }, 'real_smile');
        this.createPortrait('ba_noi_normal', {
            skin: '#d8b890', hair: '#888888', shirt: '#8a7060',
            bg: '#2a2828'
        });
        this.createPortrait('ba_noi_crying', {
            skin: '#d8b890', hair: '#888888', shirt: '#8a7060',
            bg: '#2a2828'
        }, 'crying');
        this.createPortrait('ong_tu', {
            skin: '#c8a880', hair: '#777777', shirt: '#7a6050',
            bg: '#2a2828'
        });
    },

    getFrame(charName, animName, frameIdx) {
        const char = this.cache[charName];
        if (!char) return null;
        const anim = char[animName];
        if (!anim) return null;
        return anim[frameIdx % anim.length];
    },

    getPortrait(name) {
        return this.cache[`portrait_${name}`];
    },
};
