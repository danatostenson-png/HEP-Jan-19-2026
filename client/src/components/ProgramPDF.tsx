"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontFamily: "Helvetica",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: "column",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#10b981", // Emerald-500
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: "#6B7280",
    },
    patientInfo: {
        marginBottom: 30,
        padding: 10,
        backgroundColor: "#F9FAFB",
        borderRadius: 4,
    },
    patientLabel: {
        fontSize: 10,
        color: "#6B7280",
        marginBottom: 2,
    },
    patientValue: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#111827",
    },
    exercise: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        flexDirection: "row",
        gap: 15,
    },
    exerciseImage: {
        width: 150,
        height: 100,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        objectFit: "cover",
    },
    exerciseDetails: {
        flex: 1,
    },
    exerciseTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#111827",
    },
    grid: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 8,
    },
    stat: {
        flexDirection: "column",
    },
    statLabel: {
        fontSize: 8,
        color: "#6B7280",
        textTransform: "uppercase",
    },
    statValue: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#374151",
    },
    notes: {
        marginTop: 5,
        fontSize: 9,
        fontStyle: "italic",
        color: "#4B5563",
        backgroundColor: "#FFFBEB",
        padding: 5,
        borderRadius: 2,
    },
    description: {
        fontSize: 9,
        color: "#4B5563",
        marginTop: 5,
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    }
});

interface ProgramPDFProps {
    program: any; // Using any for simplicity with complex PDF types, ideally specific Program type
}

export function ProgramPDF({ program }: ProgramPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>ExerciseRx</Text>
                        <Text style={styles.subtitle}>{program.title}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 10, color: "#6B7280" }}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Patient Info */}
                <View style={styles.patientInfo}>
                    <Text style={styles.patientLabel}>Prescribed For:</Text>
                    <Text style={styles.patientValue}>{program.patient.name}</Text>
                </View>

                {/* Exercises */}
                {program.exercises.map((exercise: any, index: number) => (
                    <View key={index} style={styles.exercise} wrap={false}>
                        {exercise.imageUrl && (
                            <Image
                                src={exercise.imageUrl}
                                style={styles.exerciseImage}
                            />
                        )}
                        <View style={styles.exerciseDetails}>
                            <Text style={styles.exerciseTitle}>{index + 1}. {exercise.title}</Text>

                            <View style={styles.grid}>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Sets</Text>
                                    <Text style={styles.statValue}>{exercise.sets || "-"}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Reps</Text>
                                    <Text style={styles.statValue}>{exercise.reps || "-"}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Frequency</Text>
                                    <Text style={styles.statValue}>{exercise.frequency || "-"}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Weight</Text>
                                    <Text style={styles.statValue}>{exercise.weight || "-"}</Text>
                                </View>
                            </View>

                            {exercise.notes && (
                                <Text style={styles.notes}>Note: {exercise.notes}</Text>
                            )}
                            {exercise.description && (
                                <Text style={styles.description}>{exercise.description}</Text>
                            )}
                        </View>
                    </View>
                ))}

                <Text style={styles.footer}>
                    Generated by ExerciseRx • Consult your practitioner before starting any exercise program.
                </Text>
            </Page>
        </Document>
    );
}
