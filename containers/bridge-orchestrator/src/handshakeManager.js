// Simplified Handshake Communication System
// Replaces complex webhook system with minimal storage footprint

class HandshakeManager {
    constructor() {
        this.connections = new Map(); // Minimal connection tracking
        this.sessions = new Map();    // Session state (temporary)
        this.handshakes = new Map();  // Active handshakes
        this.maxSessions = 100;       // Memory limit
    }

    // Initiate handshake between containers/services
    async initiate(source, target, payload = {}) {
        const handshakeId = this.generateShortId();
        const handshake = {
            id: handshakeId,
            source,
            target,
            payload,
            status: 'pending',
            created: Date.now(),
            ttl: 30000 // 30 second timeout
        };

        this.handshakes.set(handshakeId, handshake);
        
        // Auto-cleanup after TTL
        setTimeout(() => {
            if (this.handshakes.has(handshakeId)) {
                this.handshakes.delete(handshakeId);
            }
        }, handshake.ttl);

        return handshakeId;
    }

    // Acknowledge handshake
    async acknowledge(handshakeId, response = {}) {
        const handshake = this.handshakes.get(handshakeId);
        if (!handshake) {
            throw new Error('Handshake not found or expired');
        }

        handshake.status = 'acknowledged';
        handshake.response = response;
        handshake.acknowledged = Date.now();

        return handshake;
    }

    // Complete handshake
    async complete(handshakeId, result = {}) {
        const handshake = this.handshakes.get(handshakeId);
        if (!handshake) {
            throw new Error('Handshake not found or expired');
        }

        handshake.status = 'completed';
        handshake.result = result;
        handshake.completed = Date.now();

        // Remove from active handshakes after completion
        setTimeout(() => this.handshakes.delete(handshakeId), 5000);

        return handshake;
    }

    // Generate short, memory-efficient IDs
    generateShortId() {
        return Math.random().toString(36).substr(2, 8);
    }

    // Get handshake status
    getStatus(handshakeId) {
        const handshake = this.handshakes.get(handshakeId);
        return handshake ? {
            id: handshake.id,
            status: handshake.status,
            source: handshake.source,
            target: handshake.target,
            duration: handshake.completed ? 
                handshake.completed - handshake.created : 
                Date.now() - handshake.created
        } : null;
    }

    // Cleanup expired handshakes
    cleanup() {
        const now = Date.now();
        for (const [id, handshake] of this.handshakes) {
            if (now - handshake.created > handshake.ttl) {
                this.handshakes.delete(id);
            }
        }
    }

    // Get minimal stats
    getStats() {
        return {
            active: this.handshakes.size,
            connections: this.connections.size,
            sessions: this.sessions.size,
            memory: process.memoryUsage().heapUsed
        };
    }
}

module.exports = HandshakeManager;