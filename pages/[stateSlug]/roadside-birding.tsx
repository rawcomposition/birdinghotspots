import Link from "next/link";
import { getRoadsideHotspots } from "lib/firebase";
import { getState, capitalize } from "lib/helpers";

export async function getServerSideProps({ query: { stateSlug }}) {
	const state = getState(stateSlug);
	if (!state) return { notFound: true };
	
	const hotspots = await getRoadsideHotspots(state.code) || [];

	let counties = {}
	hotspots.forEach(({countySlug, slug, name}) => {
		if (!countySlug) return;
		if (!counties[countySlug]) {
			counties[countySlug] = []
		}
		counties[countySlug].push({ name, slug });
	});

	const formattedHotspots = Object.entries(counties).map(([key, hotspots]) => ({
		countySlug: key,
		countyName: capitalize(key.replaceAll("-", " ")),
		hotspots,
	}));

  return {
    props: { stateSlug: state.slug, hotspots: formattedHotspots },
  }
}

export default function RoadsideBirding({ stateSlug, hotspots }) {
	return (
		<div className="container pb-16 mt-12">
			<h1 className="text-3xl mb-12">Roadside Birding</h1>
			<div className="md:flex gap-8 items-start mb-8">
				<figure className="border p-2 bg-gray-200 text-center text-xs mb-4">
					<img src="/riddle-rd.jpg" className="md:min-w-[400px] mx-auto" />
					<figcaption className="my-3">Riddle Road, Sandusky County, Ohio<br/>Photo by Ken Ostermiller</figcaption>
				</figure>
				<div>
					<p className="mb-4">
						<strong>Birding from your vehicle</strong><br/>
						There are many locations, especially in rural counties, where you can view birds from your vehicle. Rural roads through agricultural lands, state forests and wildlife areas, “skypools” that form after a rain, airport runways near public roads, cemeteries, all are examples of places you can do roadside birding.
Safety first
					</p>
					<p className="mb-4">
						<strong>Safety first</strong><br/>
						Please use care when birding these locations. When you stop, pull off as far as you are able. Use flashers when there is traffic. If you park to get out of your vehicle, park at a pull off or on the berm completely off the pavement. Many of these locations are on roads that traverse privately owned land. Do not enter a private property without permission.
					</p>
					<p className="mb-4">
						Also, see the list of hotspot locations which have <Link href={`/birding-in-${stateSlug}/accessible-facilities`}>handicap accessible facilities</Link>.
					</p>
				</div>
			</div>
			<h3 className="text-lg mb-8 font-bold">Roadside Birding Locations Listed by County</h3>
			<div className="columns-1 sm:columns-3 mb-12">
				{hotspots.map(({countySlug, countyName, hotspots}) => (
					<p key={countySlug} className="mb-4 break-inside-avoid">
						<Link href={`/birding-in-${stateSlug}/${countySlug}-county`}>{countyName}</Link><br/>
						{hotspots.map(({name, slug}) => (
							<>
								<Link key={slug} href={`/birding-in-${stateSlug}/${countySlug}-county/${slug}`}>
									<a className="font-bold">{name}</a>
								</Link>
								<br/>
							</>
						))}
					</p>
				))}
			</div>
		</div>
	)
}