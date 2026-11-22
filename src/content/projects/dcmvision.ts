import { defineProject } from "../types";

const vtk = `- (NSString *)generate3DModelFromDICOMDirectory:(NSString *)dicomDir
                                       fileName:(NSString *)fileName
                                      threshold:(double)threshold {
    // 1) Read the DICOM series.
    vtkSmartPointer<vtkDICOMImageReader> reader = vtkSmartPointer<vtkDICOMImageReader>::New();
    reader->SetDirectoryName([dicomDir UTF8String]);
    reader->Update();

    // 2) Extract the isosurface at the requested density.
    vtkSmartPointer<vtkMarchingCubes> mc = vtkSmartPointer<vtkMarchingCubes>::New();
    mc->SetInputConnection(reader->GetOutputPort());
    mc->SetValue(0, threshold);
    mc->ComputeNormalsOn();
    mc->Update();

    // 3) Decimate, scale and clean it for the headset, then write a PLY.
    vtkSmartPointer<vtkPolyData> mesh = [self processPolyData:mc->GetOutput()];
    return [self exportPolyData:mesh withFileName:fileName];
}`;

const swift = `nonisolated func isoSurface(huThreshold: Double) throws -> URL {
    let visualizationToolkit: VisualizationToolkit = .init()

    return try visualizationToolkit.generateDICOM(
        fromDirectory: self.url,
        withName: self.id.uuidString,
        threshold: huThreshold
    )
}`;

export default defineProject({
  slug: "dcmvision",
  name: "DcmVision",
  order: 30,
  layers: ["application", "interface"],
  years: "2024 – 2025",
  stack: ["visionOS", "RealityKit", "Objective-C++", "VTK", "DCMTK", "ModelIO"],
  repo: "iOmega8561/DcmVision",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/DcmVision" }],
  accent: { light: "#0b7a80", dark: "#5fd6dd" },
  cover: "/media/dcmvision.webp",
  copy: {
    en: {
      tagline: "CT and MRI scans, in three dimensions, on Apple Vision Pro.",
      summary:
        "A reference implementation for DICOM imaging on visionOS: it reads medical scans and turns them into 3D models you can walk around.",
      blocks: [
        {
          type: "video",
          src: "/media/dcmvision-demo.mp4",
          poster: "/media/dcmvision-demo-poster.webp",
          alt: "Recorded on Apple Vision Pro: a CT series is browsed slice by slice, then reconstructed into a 3D skeleton that floats in the room.",
          caption: "Recorded on Apple Vision Pro: from the slices of an abdominal CT to a skeleton you can walk around.",
          frame: "bare",
        },
        {
          type: "statement",
          text: "Hospital-grade C++, in a headset that only speaks Swift.",
          detail:
            "DICOM is the format every scanner writes, and its reference libraries are written in C++. None of them ships for visionOS. DcmVision builds them for it, bridges them to Swift and hands the result to RealityKit.",
        },
        {
          type: "prose",
          title: "Born in a research track",
          paragraphs: [
            "DcmVision started in the Advanced Research Track Experience of the Apple Developer Academy, where I led the team, in collaboration with the University Hospital Federico II (Policlinico) of Naples. The open-source project is the reference implementation that came out of that work.",
          ],
        },
        {
          type: "pipeline",
          title: "From a folder of slices to an object in the room",
          steps: [
            { title: "Read", detail: "VTK reads the DICOM series into a volume; DCMTK provides the slice images and their metadata." },
            { title: "Extract", detail: "Marching cubes builds the surface at a density threshold in Hounsfield units: bone, for instance." },
            { title: "Lighten", detail: "Decimation halves the triangles while preserving topology; the mesh is scaled and cleaned." },
            { title: "Convert", detail: "VTK writes a PLY file; ModelIO turns it into USD, the format RealityKit loads natively." },
            { title: "Cache", detail: "The USD is kept and reused, after checking its binary header, so a series is reconstructed only once." },
            { title: "Place", detail: "RealityKit shows it in an immersive space, where you can drag, rotate and scale it with your hands." },
          ],
        },
        { type: "code", title: "The bridge, on the C++ side", file: "VTKWrapper.mm", language: "objc", code: vtk },
        {
          type: "prose",
          title: "Only what Swift needs",
          paragraphs: [
            "The Objective-C++ layer keeps VTK and DCMTK idiomatic on their side and exposes a handful of methods to Swift: is the library working, turn this folder into a model, read this slice and its metadata. Swift never sees a vtkSmartPointer.",
            "On the Swift side, generating a model is one non-isolated call on a data set, so the heavy work stays off the main actor while the interface keeps responding.",
          ],
        },
        { type: "code", file: "DicomDataSet.swift", language: "swift", code: swift },
        {
          type: "media",
          src: "/media/dcmvision.webp",
          alt: "DcmVision showing a 3D model reconstructed from a medical scan, floating in a room.",
          frame: "bare",
        },
        {
          type: "features",
          items: [
            { title: "Native libraries, cross-compiled", body: "One script builds VTK, DCMTK and zlib from source for the headset and its simulator, platforms they don’t officially support." },
            { title: "Slices and data, side by side", body: "A grid of the series, each image with an overlay of its DICOM metadata, next to the reconstructed model." },
            { title: "Private by design", body: "Fully offline and sandboxed. A research tool, explicitly not for clinical use." },
          ],
        },
      ],
    },
    it: {
      tagline: "TAC e risonanze, in tre dimensioni, su Apple Vision Pro.",
      summary:
        "Un’implementazione di riferimento per le immagini DICOM su visionOS: legge le scansioni mediche e le trasforma in modelli 3D che puoi guardare da ogni lato.",
      blocks: [
        {
          type: "video",
          src: "/media/dcmvision-demo.mp4",
          poster: "/media/dcmvision-demo-poster.webp",
          alt: "Registrato su Apple Vision Pro: una TAC viene sfogliata immagine per immagine, poi ricostruita in uno scheletro 3D sospeso nella stanza.",
          caption: "Registrato su Apple Vision Pro: dalle sezioni di una TAC addominale a uno scheletro che puoi guardare da ogni lato.",
          frame: "bare",
        },
        {
          type: "statement",
          text: "C++ da ospedale, in un visore che parla solo Swift.",
          detail:
            "DICOM è il formato che scrive ogni apparecchio diagnostico, e le sue librerie di riferimento sono in C++. Nessuna è disponibile per visionOS. DcmVision le compila per il visore, le collega a Swift e consegna il risultato a RealityKit.",
        },
        {
          type: "prose",
          title: "Nato in un percorso di ricerca",
          paragraphs: [
            "DcmVision è nato nell’Advanced Research Track Experience dell’Apple Developer Academy, dove guidavo il team, in collaborazione con l’Azienda Ospedaliera Universitaria Federico II (Policlinico) di Napoli. Il progetto open source è l’implementazione di riferimento nata da quel lavoro.",
          ],
        },
        {
          type: "pipeline",
          title: "Da una cartella di sezioni a un oggetto nella stanza",
          steps: [
            { title: "Lettura", detail: "VTK legge la serie DICOM come volume; DCMTK fornisce le immagini delle sezioni e i loro metadati." },
            { title: "Estrazione", detail: "Il marching cubes costruisce la superficie a una soglia di densità in unità Hounsfield: l’osso, per esempio." },
            { title: "Alleggerimento", detail: "La decimazione dimezza i triangoli preservando la topologia; la mesh viene scalata e ripulita." },
            { title: "Conversione", detail: "VTK scrive un file PLY; ModelIO lo trasforma in USD, il formato che RealityKit carica nativamente." },
            { title: "Cache", detail: "L’USD viene conservato e riusato, dopo averne controllato l’intestazione binaria: ogni serie si ricostruisce una volta sola." },
            { title: "Collocazione", detail: "RealityKit lo mostra in uno spazio immersivo, dove si sposta, si ruota e si ingrandisce con le mani." },
          ],
        },
        { type: "code", title: "Il ponte, dal lato C++", file: "VTKWrapper.mm", language: "objc", code: vtk },
        {
          type: "prose",
          title: "Solo ciò che serve a Swift",
          paragraphs: [
            "Lo strato in Objective-C++ lascia VTK e DCMTK idiomatici dal loro lato ed espone a Swift una manciata di metodi: la libreria funziona, trasforma questa cartella in un modello, leggi questa sezione e i suoi metadati. Swift non vede mai un vtkSmartPointer.",
            "Dal lato Swift, generare un modello è una sola chiamata non isolata su un set di dati: il lavoro pesante resta lontano dal main actor, e l’interfaccia continua a rispondere.",
          ],
        },
        { type: "code", file: "DicomDataSet.swift", language: "swift", code: swift },
        {
          type: "media",
          src: "/media/dcmvision.webp",
          alt: "DcmVision che mostra un modello 3D ricostruito da una scansione medica, sospeso in una stanza.",
          frame: "bare",
        },
        {
          type: "features",
          items: [
            { title: "Librerie native, compilate a mano", body: "Un solo script compila VTK, DCMTK e zlib dai sorgenti per il visore e il suo simulatore, piattaforme che non supportano ufficialmente." },
            { title: "Sezioni e dati, fianco a fianco", body: "Una griglia della serie, ogni immagine con i suoi metadati DICOM in sovrimpressione, accanto al modello ricostruito." },
            { title: "Privato per costruzione", body: "Completamente offline e in sandbox. Uno strumento di ricerca, espressamente non per uso clinico." },
          ],
        },
      ],
    },
  },
});
